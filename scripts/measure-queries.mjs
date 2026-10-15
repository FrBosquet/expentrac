import assert from 'node:assert/strict'
import pg from 'pg'

const connection = process.env.POSTGRES_PRISMA_URL
const url = new URL(connection)
if (
  process.env.EXPENTRAC_TEST_DB !== 'true' ||
  url.hostname !== '127.0.0.1' ||
  url.pathname !== '/audit'
)
  throw new Error('Disposable fixture database required')
const client = new pg.Client({ connectionString: connection })
const queries = [
  {
    name: 'contracts',
    index: 'Contract_userId_name_id_idx',
    ddl: 'ON "Contract"("userId", "name", "id")',
    sql: `SELECT id, name FROM "Contract" WHERE "userId" = 'perf-user-1' ORDER BY name, id LIMIT 100`
  },
  {
    name: 'notifications',
    index: 'Notification_userId_date_id_idx',
    ddl: 'ON "Notification"("userId", date DESC, id DESC)',
    sql: `SELECT id FROM "Notification" WHERE "userId" = 'perf-user-1' ORDER BY date DESC, id DESC LIMIT 100`
  },
  {
    name: 'shares',
    index: 'Share_toId_id_idx',
    ddl: 'ON "Share"("toId", id)',
    sql: `SELECT id FROM "Share" WHERE "toId" = 'perf-user-1' ORDER BY id LIMIT 100`
  }
]
function summarize(result) {
  const data = result.rows[0]['QUERY PLAN'][0]
  const nodes = []
  function walk(node) {
    nodes.push({
      type: node['Node Type'],
      index: node['Index Name'],
      rows: node['Actual Rows'],
      removed: node['Rows Removed by Filter'] ?? 0,
      buffers: node['Shared Hit Blocks']
    })
    for (const child of node.Plans ?? []) walk(child)
  }
  walk(data.Plan)
  return { executionMs: data['Execution Time'], nodes }
}
await client.connect()
try {
  await client.query('BEGIN')
  await client.query(
    `INSERT INTO "User" (id, "updatedAt") SELECT 'perf-user-' || i, now() FROM generate_series(1, 1000) i`
  )
  await client.query(
    `INSERT INTO "Contract" (id, "userId", name, type, fee, "updatedAt") SELECT 'perf-contract-' || i, 'perf-user-' || ((i % 1000)+1), 'Fixture ' || i, 'LOAN', 1000, now() FROM generate_series(1, 40000) i`
  )
  await client.query(
    `INSERT INTO "Notification" (id, "userId", date, type, "updatedAt") SELECT 'perf-notification-' || i, 'perf-user-' || ((i % 1000)+1), now() - i * interval '1 minute', 'GENERIC', now() FROM generate_series(1, 100000) i`
  )
  await client.query(
    `INSERT INTO "Share" (id, "contractId", "fromId", "toId", "updatedAt") SELECT 'perf-share-' || i, 'perf-contract-' || i, 'perf-user-' || ((i % 1000)+1), 'perf-user-' || (((i+1) % 1000)+1), now() FROM generate_series(1, 40000) i`
  )
  await client.query(
    'ANALYZE "Contract"; ANALYZE "Notification"; ANALYZE "Share"'
  )
  const report = []
  for (const query of queries) {
    await client.query(`DROP INDEX "${query.index}"`)
    const before = summarize(
      await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query.sql}`)
    )
    await client.query(`CREATE INDEX "${query.index}" ${query.ddl}`)
    const after = summarize(
      await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query.sql}`)
    )
    assert(
      after.nodes.some((node) => node.index === query.index),
      `Expected index access for ${query.name}`
    )
    assert.equal(before.nodes[0].rows, after.nodes[0].rows)
    report.push({ query: query.name, before, after })
  }
  console.log(
    JSON.stringify(
      {
        fixture: {
          users: 1000,
          contracts: 40000,
          notifications: 100000,
          shares: 40000
        },
        report
      },
      null,
      2
    )
  )
} finally {
  await client.query('ROLLBACK').catch(() => {})
  await client.end()
}
