import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import pg from 'pg'

const connection = process.env.POSTGRES_PRISMA_URL
const url = new URL(connection)
if (
  process.env.EXPENTRAC_TEST_DB !== 'true' ||
  url.hostname !== '127.0.0.1' ||
  url.pathname !== '/audit'
)
  throw new Error('Disposable fixture required')
const directory = await mkdtemp(join(tmpdir(), 'annual-month-test-'))
const client = new pg.Client({ connectionString: connection })
const version = '2026-01-01T12:00:00.000Z'
const plan = [1, 2].map((number) => ({
  periodId: `annual-period-${number}`,
  contractId: `annual-contract-${number}`,
  month: 0,
  expectedPayday: 17,
  expectedUpdatedAt: version
}))
const planPath = join(directory, 'plan.json')
let attempt = 0
function run(apply = false) {
  const result = spawnSync(
    process.execPath,
    [
      'scripts/repair-yearly-months.mjs',
      '--plan',
      planPath,
      ...(apply ? ['--apply'] : [])
    ],
    {
      env: {
        ...process.env,
        EXPENTRAC_MIGRATION_URL: connection,
        EXPENTRAC_REPAIR_BACKUP_DIR: join(directory, `attempt-${++attempt}`)
      },
      encoding: 'utf8'
    }
  )
  return { code: result.status, output: result.stdout, error: result.stderr }
}
await client.connect()
try {
  await client.query(
    `INSERT INTO "User" (id,"updatedAt") VALUES ('annual-owner',now())`
  )
  for (let number = 1; number <= 2; number++) {
    await client.query(
      `INSERT INTO "Contract" (id,"userId",name,type,"updatedAt") VALUES ($1,'annual-owner','Synthetic annual','SUBSCRIPTION',$2)`,
      [`annual-contract-${number}`, version]
    )
    await client.query(
      `INSERT INTO "Period" (id,"contractId","from",fee,payday,periodicity,"updatedAt") VALUES ($1,$2,'2023-01-01',1234,17,'YEARLY',$3)`,
      [`annual-period-${number}`, `annual-contract-${number}`, version]
    )
  }
  await writeFile(planPath, JSON.stringify(plan))
  assert.equal(run().code, 0)
  const months = async () =>
    (
      await client.query(
        `SELECT paymonth,fee,payday FROM "Period" WHERE id LIKE 'annual-period-%' ORDER BY id`
      )
    ).rows
  assert.deepEqual(
    (await months()).map((row) => row.paymonth),
    [null, null]
  )
  await client.query(
    `UPDATE "Period" SET "updatedAt"='2026-02-01' WHERE id='annual-period-2'`
  )
  assert.notEqual(run(true).code, 0)
  assert.deepEqual(
    (await months()).map((row) => row.paymonth),
    [null, null]
  )
  await client.query(
    `UPDATE "Period" SET "updatedAt"=$1 WHERE id='annual-period-2'`,
    [version]
  )
  await client.query(
    `UPDATE "Period" SET paymonth=5 WHERE id='annual-period-2'`
  )
  assert.notEqual(run(true).code, 0)
  assert.deepEqual(
    (await months()).map((row) => row.paymonth),
    [null, 5]
  )
  await client.query(
    `UPDATE "Period" SET paymonth=NULL WHERE id='annual-period-2'`
  )
  const applied = run(true)
  assert.equal(applied.code, 0, applied.error)
  assert.equal(JSON.parse(applied.output).updated, 2)
  assert.deepEqual(await months(), [
    { paymonth: 0, fee: 1234, payday: 17 },
    { paymonth: 0, fee: 1234, payday: 17 }
  ])
  assert.equal(
    (await stat(join(directory, `attempt-${attempt}`, 'before.json'))).mode &
      0o777,
    0o600
  )
  assert.equal(JSON.parse(run(true).output).updated, 0)
  const changed = [{ ...plan[0], expectedPayday: 18 }]
  await writeFile(planPath, JSON.stringify(changed))
  assert.notEqual(run(true).code, 0)
  await writeFile(planPath, JSON.stringify([plan[0], plan[0]]))
  assert.notEqual(run(true).code, 0)
  console.log(
    'Annual month repair: dry-run, stale-version atomic refusal, existing-month protection, exact updates, private backup, idempotency and identity guards passed'
  )
} finally {
  await client.end()
  await rm(directory, { recursive: true, force: true })
}
