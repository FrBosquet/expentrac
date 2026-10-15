import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
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
const client = new pg.Client({ connectionString: connection })
const directory = await mkdtemp(join(tmpdir(), 'legacy-reconciliation-'))
async function report(args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', 'scripts/reconcile-legacy.mjs', ...args],
      {
        env: { ...process.env, EXPENTRAC_MIGRATION_URL: connection },
        stdio: ['ignore', 'pipe', 'pipe']
      }
    )
    let output = '',
      error = ''
    child.stdout.on('data', (data) => {
      output += data
    })
    child.stderr.on('data', (data) => {
      error += data
    })
    child.on('error', reject)
    child.on('exit', (code) =>
      error
        ? reject(new Error(error))
        : resolve({ code, data: JSON.parse(output) })
    )
  })
}
await client.connect()
try {
  await client.query(
    `INSERT INTO "User" (id, "updatedAt") VALUES ('legacy-owner', now()), ('legacy-recipient', now())`
  )
  await client.query(
    `INSERT INTO "Contract" (id, "userId", name, type, fee, "updatedAt") VALUES ('legacy-loan', 'legacy-owner', 'Synthetic loan', 'LOAN', 100, now())`
  )
  await client.query(
    `INSERT INTO "Period" (id, "contractId", "from", "to", fee, payday, "updatedAt") VALUES ('legacy-period', 'legacy-loan', '2026-01-01', '2027-01-01', 1234, 1, now())`
  )
  await client.query(
    `INSERT INTO "Loan" (id, "userId", name, fee, initial, "startDate", "endDate", "updatedAt") VALUES ('legacy-loan', 'legacy-owner', 'Synthetic loan', 1234, 100, '2026-01-01', '2027-01-01', now())`
  )
  await client.query(
    `INSERT INTO "LoanShare" (id, "loanId", "userId", accepted, "updatedAt") VALUES ('legacy-share', 'legacy-loan', 'legacy-recipient', true, now())`
  )
  await client.query(
    `INSERT INTO "Share" (id, "contractId", "fromId", "toId", accepted, "updatedAt") VALUES ('current-share', 'legacy-loan', 'legacy-owner', 'legacy-recipient', true, now())`
  )
  let result = await report()
  assert.equal(result.code, 0, JSON.stringify(result.data))
  assert.equal(result.data.equivalent, 1)
  assert.equal(
    (await client.query('SELECT count(*)::int AS count FROM "Loan"')).rows[0]
      .count,
    1
  )
  await client.query(
    `UPDATE "Contract" SET id = 'mapped-contract' WHERE id = 'legacy-loan'`
  )
  result = await report()
  assert.equal(result.code, 2)
  assert.deepEqual(result.data.exceptions[0].candidates, ['mapped-contract'])
  const mapping = join(directory, 'mapping.json')
  await writeFile(
    mapping,
    JSON.stringify([
      {
        legacyType: 'Loan',
        legacyId: 'legacy-loan',
        contractId: 'mapped-contract'
      }
    ]),
    { mode: 0o600 }
  )
  result = await report(['--mapping', mapping])
  assert.equal(result.code, 0)
  await client.query(`UPDATE "Period" SET fee = 999 WHERE id = 'legacy-period'`)
  result = await report(['--mapping', mapping])
  assert.equal(result.code, 2)
  assert(result.data.exceptions[0].issues.includes('period-fee'))
  await client.query(
    `UPDATE "Share" SET accepted = false WHERE id = 'current-share'`
  )
  result = await report(['--mapping', mapping])
  assert(result.data.exceptions[0].issues.includes('recipients-or-acceptance'))
  console.log(
    'Read-only legacy equivalence, explicit mapping, money and acceptance mismatches verified'
  )
} finally {
  await client.end()
  await rm(directory, { recursive: true, force: true })
}
