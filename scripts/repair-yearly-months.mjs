// Reviewed data repair only: explicit target/plan, no automatic .env loading.
import pg from 'pg'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, relative, sep } from 'node:path'

pg.types.setTypeParser(1114, (value) => new Date(value.replace(' ', 'T') + 'Z'))
let client,
  committed = false
try {
  const args = process.argv.slice(2)
  const apply = args.at(-1) === '--apply'
  if (apply) args.pop()
  if (args.length !== 2 || args[0] !== '--plan')
    throw new Error('Use --plan <private-plan.json> [--apply]')
  const connection = process.env.EXPENTRAC_MIGRATION_URL
  if (!connection) throw new Error('Explicit EXPENTRAC_MIGRATION_URL required')
  const plan = JSON.parse(await readFile(args[1], 'utf8'))
  if (!Array.isArray(plan) || !plan.length || plan.length > 100)
    throw new Error('Plan must contain 1–100 reviewed periods')
  const ids = new Set()
  for (const item of plan) {
    if (
      !item ||
      !['periodId', 'contractId'].every(
        (key) =>
          typeof item[key] === 'string' && /^[\w-]{1,128}$/.test(item[key])
      ) ||
      !Number.isInteger(item.month) ||
      item.month < 0 ||
      item.month > 11 ||
      !Number.isInteger(item.expectedPayday) ||
      item.expectedPayday < 1 ||
      item.expectedPayday > 31 ||
      typeof item.expectedUpdatedAt !== 'string' ||
      !Number.isFinite(Date.parse(item.expectedUpdatedAt)) ||
      ids.has(item.periodId)
    )
      throw new Error('Invalid or duplicate repair plan entry')
    ids.add(item.periodId)
  }
  let directory
  if (apply) {
    const destination = process.env.EXPENTRAC_REPAIR_BACKUP_DIR
    if (!destination)
      throw new Error('Explicit EXPENTRAC_REPAIR_BACKUP_DIR required')
    directory = resolve(destination)
    const location = relative(process.cwd(), directory)
    if (location !== '..' && !location.startsWith('..' + sep))
      throw new Error('Private backup directory must be outside the repository')
    await mkdir(directory, { mode: 0o700 })
  }
  client = new pg.Client({
    connectionString: connection,
    connectionTimeoutMillis: 10000
  })
  await client.connect()
  await client.query(
    apply ? 'BEGIN' : 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'
  )
  await client.query("SET LOCAL lock_timeout = '5s'")
  await client.query("SET LOCAL statement_timeout = '15s'")
  const before = [],
    changes = []
  for (const item of [...plan].sort((a, b) =>
    a.periodId.localeCompare(b.periodId)
  )) {
    const row = (
      await client.query(
        `SELECT p.*, c.type AS "contractType" FROM "Period" p
       JOIN "Contract" c ON c.id = p."contractId" WHERE p.id = $1
       ${apply ? 'FOR UPDATE OF p, c' : ''}`,
        [item.periodId]
      )
    ).rows[0]
    if (
      !row ||
      row.contractId !== item.contractId ||
      row.contractType !== 'SUBSCRIPTION' ||
      row.periodicity !== 'YEARLY' ||
      row.to !== null ||
      row.payday !== item.expectedPayday
    )
      throw new Error(
        'Reviewed period identity or schedule changed; no repair applied'
      )
    before.push(row)
    if (row.paymonth === item.month) continue
    if (
      row.paymonth !== null ||
      row.updatedAt.getTime() !== Date.parse(item.expectedUpdatedAt)
    )
      throw new Error(
        'Reviewed period version or month changed; no repair applied'
      )
    changes.push(item)
  }
  if (apply) {
    await writeFile(
      resolve(directory, 'before.json'),
      JSON.stringify({ plan, rows: before }, null, 2),
      { mode: 0o600, flag: 'wx' }
    )
    for (const item of changes) {
      const result = await client.query(
        `UPDATE "Period" SET paymonth = $1, "updatedAt" = timezone('UTC', clock_timestamp())
         WHERE id = $2 AND "contractId" = $3 AND paymonth IS NULL
         AND "updatedAt" = $4::timestamp RETURNING id`,
        [item.month, item.periodId, item.contractId, item.expectedUpdatedAt]
      )
      if (result.rowCount !== 1)
        throw new Error('Concurrent period change; repair rolled back')
    }
    const after = (
      await client.query(
        'SELECT * FROM "Period" WHERE id = ANY($1) ORDER BY id',
        [[...ids]]
      )
    ).rows
    for (const item of plan) {
      const row = after.find((entry) => entry.id === item.periodId)
      const original = before.find((entry) => entry.id === item.periodId)
      if (
        !row ||
        row.paymonth !== item.month ||
        Object.keys(original).some(
          (key) =>
            !['paymonth', 'updatedAt', 'contractType'].includes(key) &&
            JSON.stringify(row[key]) !== JSON.stringify(original[key])
        )
      )
        throw new Error('Post-repair check failed; transaction rolled back')
    }
    await writeFile(
      resolve(directory, 'after.json'),
      JSON.stringify(after, null, 2),
      { mode: 0o600, flag: 'wx' }
    )
    await client.query('COMMIT')
    committed = true
  } else await client.query('ROLLBACK')
  console.log(
    JSON.stringify({
      mode: apply ? 'applied' : 'dry-run',
      planned: plan.length,
      [apply ? 'updated' : 'missing']: changes.length,
      alreadyCorrect: plan.length - changes.length
    })
  )
} catch {
  await client?.query('ROLLBACK').catch(() => {})
  console.error(
    committed
      ? 'Repair committed; inspect private reports'
      : 'Repair refused or failed; no changes committed. Review target, plan and private backup directory.'
  )
  process.exitCode = 1
} finally {
  await client?.end().catch(() => {})
}
