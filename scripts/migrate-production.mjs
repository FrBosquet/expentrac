// Intentionally does not load .env files. Never infer a production target.
import pg from 'pg'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdir, open, writeFile, chmod } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const require = createRequire(import.meta.url)
const args = process.argv.slice(2)
if (args.some((arg) => arg !== '--apply'))
  throw new Error('Usage: node scripts/migrate-production.mjs [--apply]')
const apply = args.includes('--apply')
const connection = process.env.EXPENTRAC_MIGRATION_URL
if (!connection)
  throw new Error(
    'Set EXPENTRAC_MIGRATION_URL explicitly to a direct PostgreSQL connection'
  )
let target
try {
  target = new URL(connection)
} catch {
  throw new Error('Invalid migration URL; connection details are not logged')
}
if (!['postgres:', 'postgresql:'].includes(target.protocol))
  throw new Error('PostgreSQL connection required')
const pgEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith('PG'))
)
Object.assign(pgEnvironment, {
  PGHOST: target.hostname,
  PGPORT: target.port || '5432',
  PGUSER: decodeURIComponent(target.username),
  PGPASSWORD: decodeURIComponent(target.password),
  PGDATABASE: decodeURIComponent(target.pathname.slice(1)),
  PGCONNECT_TIMEOUT: '10'
})
const supportedOptions = {
  sslmode: 'PGSSLMODE',
  sslcert: 'PGSSLCERT',
  sslkey: 'PGSSLKEY',
  sslrootcert: 'PGSSLROOTCERT',
  options: 'PGOPTIONS',
  connect_timeout: 'PGCONNECT_TIMEOUT',
  application_name: 'PGAPPNAME',
  channel_binding: 'PGCHANNELBINDING'
}
for (const [key, value] of target.searchParams) {
  if (!supportedOptions[key])
    throw new Error(`Unsupported migration connection option: ${key}`)
  pgEnvironment[supportedOptions[key]] = value
}
if (
  apply &&
  (process.env.EXPENTRAC_MAINTENANCE_CONFIRMED !== 'true' ||
    process.env.EXPENTRAC_RESTORE_REHEARSED !== 'true')
)
  throw new Error(
    'Apply requires stopped application/cron traffic and a rehearsed backup restore; see docs/audits/money-migration.md'
  )
const backupDirectory = process.env.EXPENTRAC_MIGRATION_BACKUP_DIR
if (apply && !backupDirectory)
  throw new Error(
    'Set a new EXPENTRAC_MIGRATION_BACKUP_DIR outside the repository'
  )
const fields = [
  ['Contract', 'fee'],
  ['Period', 'fee'],
  ['Loan', 'fee'],
  ['Loan', 'initial'],
  ['Subscription', 'fee']
]
const client = new pg.Client({
  connectionString: connection,
  application_name: 'expentrac-migration',
  connectionTimeoutMillis: 10000
})

async function inspect() {
  const money = []
  for (const [table, column] of fields) {
    const type = (
      await client.query(
        `SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, column]
      )
    ).rows[0]?.data_type
    if (!['double precision', 'integer'].includes(type))
      throw new Error(`Unexpected schema for ${table}.${column}`)
    const cents =
      type === 'integer'
        ? `"${column}"::numeric`
        : `round("${column}"::numeric * 100)`
    const ceiling = type === 'integer' ? '2147483647' : '21474836.47'
    const result = (
      await client.query(`SELECT count(*)::text AS rows, count("${column}")::text AS nonnull,
      count(*) FILTER (WHERE "${column}" < 0 OR "${column}" > ${ceiling} OR "${column}"::text IN ('NaN', 'Infinity', '-Infinity'))::text AS invalid,
      coalesce(sum(${cents}), 0)::text AS expected_cents
      FROM public."${table}"`)
    ).rows[0]
    money.push({ table, column, type, ...result })
  }
  const duplicateShares = (
    await client.query(
      `SELECT count(*)::text AS count FROM (SELECT "contractId", "toId" FROM "Share" GROUP BY "contractId", "toId" HAVING count(*) > 1) duplicates`
    )
  ).rows[0].count
  const legacy = (
    await client.query(
      `SELECT (SELECT count(*)::text FROM "Loan") AS loans, (SELECT count(*)::text FROM "Subscription") AS subscriptions, (SELECT count(*)::text FROM "UserProvider") AS provider_links`
    )
  ).rows[0]
  return { money, duplicateShares, legacy }
}

function run(command, parameters, env, stdout = 'ignore') {
  return new Promise((resolveRun, reject) => {
    // CLI errors may contain a connection string. Keep raw subprocess output private.
    const child = spawn(command, parameters, {
      env,
      stdio: ['ignore', stdout, 'pipe']
    })
    let diagnostic = ''
    child.stderr.on('data', (data) => {
      diagnostic = (diagnostic + data).slice(-3000)
    })
    child.on('error', () =>
      reject(
        new Error(
          'Migration tool unavailable; check installed PostgreSQL/Prisma tools'
        )
      )
    )
    child.on('exit', (code) => {
      if (code === 0) resolveRun()
      else {
        if (
          process.env.EXPENTRAC_TEST_DB === 'true' &&
          target.hostname === '127.0.0.1'
        )
          console.error(diagnostic)
        reject(
          new Error(
            'Migration tool failed; preserve backup and inspect migration state before retrying'
          )
        )
      }
    })
  })
}

let locked = false
try {
  await client.connect()
  if (apply) {
    locked = (
      await client.query(`SELECT pg_try_advisory_lock(1876439201) AS locked`)
    ).rows[0].locked
    if (!locked) throw new Error('Another Expentrac migration is running')
  }
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
  const before = await inspect()
  await client.query('COMMIT')
  if (!apply)
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          ...before,
          note: 'No writes. Legacy rows retained; equivalence requires separate reconciliation.'
        },
        null,
        2
      )
    )
  if (before.money.some((field) => field.invalid !== '0'))
    throw new Error(
      'Invalid money values: run dry-run inspection queries on the restored copy and resolve exceptions'
    )
  const types = new Set(before.money.map((field) => field.type))
  if (types.size !== 1)
    throw new Error(
      'Mixed money units detected; manual reconciliation required'
    )
  if (apply) {
    const directory = resolve(backupDirectory)
    // Exclusive mkdir prevents accidental overwrite of an earlier backup.
    await mkdir(directory, { mode: 0o700 })
    await chmod(directory, 0o700)
    await writeFile(
      join(directory, 'before.json'),
      JSON.stringify(before, null, 2),
      { mode: 0o600, flag: 'wx' }
    )
    const dump = await open(join(directory, 'before.dump'), 'wx', 0o600)
    try {
      const local = '/opt/homebrew/opt/libpq/bin/pg_dump'
      const docker = process.env.CI === 'true' && process.platform === 'linux'
      await run(
        docker ? 'docker' : existsSync(local) ? local : 'pg_dump',
        docker
          ? [
              'run',
              '--rm',
              '--network=host',
              ...Object.keys(pgEnvironment)
                .filter((key) => key.startsWith('PG'))
                .flatMap((key) => ['--env', key]),
              'postgres:17',
              'pg_dump',
              '--format=custom',
              '--no-owner',
              '--no-acl'
            ]
          : ['--format=custom', '--no-owner', '--no-acl'],
        pgEnvironment,
        dump.fd
      )
      await dump.sync()
    } finally {
      await dump.close()
    }
    // Dedicated config cannot pick up a different URL from .env.local.
    const config = join(directory, 'prisma.config.cjs')
    await writeFile(
      config,
      `module.exports = { schema: ${JSON.stringify(resolve('prisma/schema.prisma'))}, migrations: { path: ${JSON.stringify(resolve('prisma/migrations'))} }, datasource: { url: process.env.EXPENTRAC_MIGRATION_URL } };\n`,
      { mode: 0o600, flag: 'wx' }
    )
    await run(
      process.execPath,
      [
        require.resolve('prisma/build/index.js'),
        'migrate',
        'deploy',
        '--config',
        config
      ],
      { ...process.env, EXPENTRAC_MIGRATION_URL: connection }
    )
    const after = await inspect()
    for (let index = 0; index < before.money.length; index++) {
      const old = before.money[index],
        current = after.money[index]
      if (
        current.type !== 'integer' ||
        current.invalid !== '0' ||
        ['rows', 'nonnull', 'expected_cents'].some(
          (key) => current[key] !== old[key]
        )
      )
        throw new Error(
          'Post-migration validation failed; keep maintenance enabled and follow recovery procedure'
        )
    }
    await writeFile(
      join(directory, 'after.json'),
      JSON.stringify(after, null, 2),
      { mode: 0o600, flag: 'wx' }
    )
    console.log(
      'Migrations applied and money counts/totals verified. Keep maintenance enabled until the matching application passes smoke checks. Backup and reports are in the selected directory.'
    )
  }
} catch (error) {
  // pg errors may include row values or credentials; only emit our own controlled errors.
  console.error(
    error instanceof Error && error.constructor === Error
      ? error.message
      : 'Database operation failed; keep maintenance enabled and inspect the database privately'
  )
  process.exitCode = 1
} finally {
  if (locked)
    await client.query('SELECT pg_advisory_unlock(1876439201)').catch(() => {})
  await client.end().catch(() => {})
}
