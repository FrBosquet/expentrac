import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import pg from 'pg'

const connection = process.env.POSTGRES_PRISMA_URL
const url = new URL(connection)
if (process.env.EXPENTRAC_TEST_DB !== 'true' || url.hostname !== '127.0.0.1' || url.pathname !== '/audit') throw new Error('Disposable database required')
const dumpPath = join(process.env.TEST_DUMP_DIRECTORY, 'before-cents.dump')
const client = new pg.Client({ connectionString: connection })
await client.connect()
function tool(name, args, input) {
  const local = `/opt/homebrew/opt/libpq/bin/${name}`
  const useDocker = process.env.CI === 'true' && process.platform === 'linux'
  const command = useDocker ? 'docker' : existsSync(local) ? local : name
  const parameters = useDocker ? ['run', '--rm', '--network=host', '-i', 'postgres:17', name, ...args] : args
  return new Promise((resolve, reject) => {
    const child = spawn(command, parameters, { stdio: ['pipe', 'pipe', 'pipe'] })
    const output = []; let error = ''
    child.stdout.on('data', (data) => output.push(data))
    child.stderr.on('data', (data) => { error += data })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve(Buffer.concat(output)) : reject(new Error(`${name} failed: ${error}`)))
    child.stdin.end(input)
  })
}
try {
  if (process.argv[2] === 'seed') {
    await client.query(`INSERT INTO "User" (id, name, "updatedAt") VALUES ('money-user', 'Synthetic money fixture', CURRENT_TIMESTAMP)`)
    await client.query(`INSERT INTO "Contract" (id, "userId", name, type, fee, "updatedAt") VALUES ('money-contract', 'money-user', 'Fixture', 'LOAN', 10.005, CURRENT_TIMESTAMP)`)
    await client.query(`INSERT INTO "Period" (id, "contractId", "from", fee, "updatedAt") VALUES ('money-period', 'money-contract', '2026-01-01', 0.105, CURRENT_TIMESTAMP)`)
    await client.query(`INSERT INTO "Loan" (id, "userId", name, fee, initial, "startDate", "endDate", "updatedAt") VALUES ('money-legacy', 'money-user', 'Legacy fixture', 123.456, 1.005, '2026-01-01', '2027-01-01', CURRENT_TIMESTAMP)`)
    await client.query(`INSERT INTO "Subscription" (id, "userId", name, fee, "updatedAt") VALUES ('money-sub', 'money-user', 'Legacy subscription', 99.995, CURRENT_TIMESTAMP)`)
    await writeFile(dumpPath, await tool('pg_dump', ['--format=custom', '--no-owner', '--no-acl', connection]))
  } else {
    assert.equal((await client.query('SELECT fee FROM "Contract" WHERE id = $1', ['money-contract'])).rows[0].fee, 1001)
    assert.equal((await client.query('SELECT fee FROM "Period" WHERE id = $1', ['money-period'])).rows[0].fee, 11)
    assert.deepEqual((await client.query('SELECT fee, initial FROM "Loan" WHERE id = $1', ['money-legacy'])).rows[0], { fee: 12346, initial: 101 })
    assert.equal((await client.query('SELECT fee FROM "Subscription" WHERE id = $1', ['money-sub'])).rows[0].fee, 10000)
    await client.query('CREATE DATABASE audit_restore')
    const restoreUrl = new URL(connection); restoreUrl.pathname = '/audit_restore'
    await tool('pg_restore', ['--no-owner', '--no-acl', '--exit-on-error', '--dbname', restoreUrl.toString()], await readFile(dumpPath))
    const restored = new pg.Client({ connectionString: restoreUrl.toString() }); await restored.connect()
    try {
      assert.equal((await restored.query('SELECT fee FROM "Contract" WHERE id = $1', ['money-contract'])).rows[0].fee, 10.005)
      assert.equal((await restored.query('SELECT count(*)::int AS count FROM "User"')).rows[0].count, 1)
      const sql = await readFile('prisma/migrations/20261014210000_integer_cents/migration.sql', 'utf8')
      await restored.query('UPDATE "Contract" SET fee = -1 WHERE id = $1', ['money-contract'])
      await assert.rejects(restored.query(sql), /Money reconciliation required/)
      await restored.query('ROLLBACK')
      const type = (await restored.query(`SELECT data_type FROM information_schema.columns WHERE table_name = 'Contract' AND column_name = 'fee'`)).rows[0].data_type
      assert.equal(type, 'double precision')
    } finally { await restored.end() }
    console.log('Cent conversion, unsafe-data rollback and real synthetic backup/restore verified')
  }
} finally { await client.end() }
