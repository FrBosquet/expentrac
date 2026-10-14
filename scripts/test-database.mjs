import EmbeddedPostgres from 'embedded-postgres'
import { mkdtemp, rm, cp, mkdir, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const directory = await mkdtemp(join(tmpdir(), 'expentrac-test-'))
const postgres = new EmbeddedPostgres({
  databaseDir: join(directory, 'db'),
  port: 55432,
  user: 'audit',
  password: 'audit',
  persistent: false,
  postgresFlags: ['-h', '127.0.0.1', '-k', directory],
  onLog: () => {}
})
const env = {
  ...process.env,
  POSTGRES_PRISMA_URL: 'postgresql://audit:audit@127.0.0.1:55432/audit',
  POSTGRES_URL_NON_POOLING: 'postgresql://audit:audit@127.0.0.1:55432/audit',
  DATABASE_URL: 'postgresql://audit:audit@127.0.0.1:55432/audit',
  EXPENTRAC_TEST_DB: 'true',
  RESEND_KEY: 're_local_test',
  CRON_SECRET: 'local-test-secret'
}
function run(command, args, quiet = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit'
    })
    let output = ''
    if (quiet)
      for (const stream of [child.stdout, child.stderr])
        stream.on('data', (data) => {
          output = (output + data).slice(-6000)
        })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else {
        if (quiet) console.error(output)
        reject(new Error(`Test process exited ${code}`))
      }
    })
  })
}
try {
  await postgres.initialise()
  await postgres.start()
  await postgres.createDatabase('audit')
  if (process.env.EXPENTRAC_MONEY_FIXTURE === 'true') {
    const migrations = join(directory, 'migrations')
    await mkdir(migrations)
    for (const name of await readdir('prisma/migrations')) {
      if (
        name === 'migration_lock.toml' ||
        name < '20261014210000_integer_cents'
      )
        await cp(join('prisma/migrations', name), join(migrations, name), {
          recursive: true
        })
    }
    const configPath = join(directory, 'prisma.config.cjs')
    await writeFile(
      configPath,
      `const { defineConfig } = require(${JSON.stringify(require.resolve('prisma/config'))}); module.exports = defineConfig(${JSON.stringify({ schema: join(process.cwd(), 'prisma/schema.prisma'), migrations: { path: migrations }, datasource: { url: env.POSTGRES_URL_NON_POOLING } })});`
    )
    await run(
      process.execPath,
      [
        require.resolve('prisma/build/index.js'),
        'migrate',
        'deploy',
        '--config',
        configPath
      ],
      true
    )
    env.TEST_DUMP_DIRECTORY = directory
    await run(process.execPath, ['scripts/money-migration-test.mjs', 'seed'])
  }
  await run(
    process.execPath,
    [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
    true
  )
  if (process.env.EXPENTRAC_MONEY_FIXTURE === 'true')
    await run(process.execPath, ['scripts/money-migration-test.mjs', 'verify'])
  const [command, ...args] = process.argv.slice(2)
  if (command)
    await run(command, command === 'node' ? ['--import', 'tsx', ...args] : args)
  console.log('Disposable PostgreSQL migration checks passed')
} finally {
  await postgres.stop()
  await rm(directory, { recursive: true, force: true })
}
