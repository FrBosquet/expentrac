import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import pg from 'pg'

const connection = process.env.POSTGRES_PRISMA_URL
const url = new URL(connection)
if (
  process.env.EXPENTRAC_TEST_DB !== 'true' ||
  url.hostname !== '127.0.0.1' ||
  url.pathname !== '/audit'
)
  throw new Error('Disposable fixture required')
async function run(args, additions = {}) {
  const env = { ...process.env, ...additions }
  for (const key of [
    'EXPENTRAC_LOCAL_DATABASE_URL',
    'EXPENTRAC_MIGRATION_URL',
    'EXPENTRAC_MAINTENANCE_CONFIRMED',
    'EXPENTRAC_RESTORE_REHEARSED'
  ])
    if (!(key in additions)) delete env[key]
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', 'tsx', ...args], {
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let stdout = '',
      stderr = ''
    child.stdout.on('data', (data) => {
      stdout += data
    })
    child.stderr.on('data', (data) => {
      stderr += data
    })
    child.on('error', reject)
    child.on('exit', (code) => resolve({ code, stdout, stderr }))
  })
}
assert.notEqual((await run(['scripts/prisma-local.mjs', 'migrate'])).code, 0)
assert.notEqual(
  (
    await run(['scripts/prisma-local.mjs', 'studio'], {
      EXPENTRAC_LOCAL_DATABASE_URL:
        'postgresql://fixture:fixture@example.invalid/audit'
    })
  ).code,
  0
)
assert.equal(
  (
    await run(['scripts/prisma-local.mjs', 'migrate', '--help'], {
      EXPENTRAC_LOCAL_DATABASE_URL: connection
    })
  ).code,
  0
)
assert.notEqual(
  (
    await run(['scripts/prisma-local.mjs', 'studio'], {
      EXPENTRAC_LOCAL_DATABASE_URL: connection + '?host=example.invalid'
    })
  ).code,
  0
)
assert.notEqual(
  (
    await run(
      ['scripts/prisma-local.mjs', 'migrate', '--config', 'another.config.ts'],
      { EXPENTRAC_LOCAL_DATABASE_URL: connection }
    )
  ).code,
  0
)
const client = new pg.Client({ connectionString: connection })
const malformed = await run(['scripts/migrate-production.mjs'], {
  EXPENTRAC_MIGRATION_URL: 'not-a-url-production-secret'
})
assert.notEqual(malformed.code, 0)
assert(!malformed.stderr.includes('not-a-url-production-secret'))
await client.connect()
try {
  await client.query(
    `INSERT INTO "User" (id, "updatedAt") VALUES ('maintenance-user', now())`
  )
  await client.query(
    `INSERT INTO "Contract" (id, "userId", name, type, "updatedAt") VALUES ('maintenance-contract', 'maintenance-user', 'Synthetic fixture', 'WORK', now())`
  )
  await client.query(
    `INSERT INTO "Period" (id, "contractId", "from", fee, "updatedAt") VALUES ('maintenance-period', 'maintenance-contract', '2026-01-31 23:00:00', 100, now())`
  )
  const target = { EXPENTRAC_MIGRATION_URL: connection }
  const dry = await run(['scripts/backfill-paydays.cjs'], target)
  assert.equal(dry.code, 0, dry.stderr)
  assert.equal(JSON.parse(dry.stdout).checked, 1)
  assert.equal(
    (
      await client.query('SELECT payday FROM "Period" WHERE id = $1', [
        'maintenance-period'
      ])
    ).rows[0].payday,
    null
  )
  assert.notEqual(
    (await run(['scripts/backfill-paydays.cjs', '--apply'], target)).code,
    0
  )
  const applied = await run(['scripts/backfill-paydays.cjs', '--apply'], {
    ...target,
    EXPENTRAC_MAINTENANCE_CONFIRMED: 'true',
    EXPENTRAC_RESTORE_REHEARSED: 'true'
  })
  assert.equal(applied.code, 0, applied.stderr)
  assert.equal(JSON.parse(applied.stdout).updated, 1)
  assert.deepEqual(
    (
      await client.query('SELECT payday, fee FROM "Period" WHERE id = $1', [
        'maintenance-period'
      ])
    ).rows[0],
    { payday: 1, fee: 100 }
  )
  assert.equal(
    JSON.parse((await run(['scripts/backfill-paydays.cjs'], target)).stdout)
      .checked,
    0
  )
  console.log(
    'Local command guards and Madrid payday dry-run/apply/idempotency verified'
  )
} finally {
  await client.end()
}
