// Read-only, including when pointed at production. Prefer an isolated restored copy.
import pg from 'pg'
import { readFile } from 'node:fs/promises'
import { eurosToCents } from '../lib/money.ts'

// Prisma DateTime columns are UTC timestamp-without-time-zone values.
pg.types.setTypeParser(1114, (value) => new Date(value.replace(' ', 'T') + 'Z'))

const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--mapping'))
  throw new Error(
    'Usage: node --import tsx scripts/reconcile-legacy.mjs [--mapping file.json]'
  )
const connection = process.env.EXPENTRAC_MIGRATION_URL
if (!connection)
  throw new Error(
    'Set EXPENTRAC_MIGRATION_URL explicitly; no .env files are loaded'
  )
const mapping = args.length ? JSON.parse(await readFile(args[1], 'utf8')) : []
if (!Array.isArray(mapping)) throw new Error('Mapping must be an array')
const mappings = new Map(),
  targets = new Set()
for (const item of mapping) {
  if (
    !item ||
    !['Loan', 'Subscription'].includes(item.legacyType) ||
    !['legacyId', 'contractId'].every(
      (key) =>
        typeof item[key] === 'string' && /^[\w:/-]{1,128}$/.test(item[key])
    )
  )
    throw new Error('Invalid legacy mapping')
  const key = `${item.legacyType}/${item.legacyId}`
  if (mappings.has(key) || targets.has(item.contractId))
    throw new Error('Duplicate source or target mapping')
  mappings.set(key, item.contractId)
  targets.add(item.contractId)
}
const client = new pg.Client({
  connectionString: connection,
  connectionTimeoutMillis: 10000,
  application_name: 'expentrac-legacy-reconciliation'
})
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right)
const normalize = (items) => items.map((item) => JSON.stringify(item)).sort()
const day = (date) => (date ? new Date(date).toISOString().slice(0, 10) : null)
try {
  await client.connect()
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
  const types = (
    await client.query(
      `SELECT DISTINCT data_type FROM information_schema.columns WHERE table_schema = 'public' AND (table_name, column_name) IN (('Contract','fee'),('Period','fee'),('Loan','fee'),('Loan','initial'),('Subscription','fee'))`
    )
  ).rows
  if (
    types.length !== 1 ||
    !['integer', 'double precision'].includes(types[0].data_type)
  )
    throw new Error('Unsupported or mixed money units')
  const cents = (value) =>
    value === null
      ? null
      : types[0].data_type === 'integer'
        ? Number(value)
        : eurosToCents(String(value))
  const rows = [],
    usedTargets = new Set(),
    visitedMappings = new Set()
  for (const legacyType of ['Loan', 'Subscription']) {
    let cursor = ''
    while (true) {
      const sources = (
        await client.query(
          `SELECT * FROM "${legacyType}" WHERE id > $1 ORDER BY id LIMIT 100`,
          [cursor]
        )
      ).rows
      if (!sources.length) break
      for (const source of sources) {
        const key = `${legacyType}/${source.id}`
        const contractId = mappings.get(key) ?? source.id
        if (mappings.has(key)) visitedMappings.add(key)
        const current = (
          await client.query('SELECT * FROM "Contract" WHERE id = $1', [
            contractId
          ])
        ).rows[0]
        const issues = []
        if (!current) {
          const candidates = (
            await client.query(
              'SELECT id FROM "Contract" WHERE "userId" = $1 AND name = $2 AND type = $3 ORDER BY id',
              [
                source.userId,
                source.name,
                legacyType === 'Loan' ? 'LOAN' : 'SUBSCRIPTION'
              ]
            )
          ).rows.map(({ id }) => id)
          rows.push({
            legacyType,
            legacyId: source.id,
            contractId: null,
            issues: ['mapping-or-import-required'],
            candidates
          })
          continue
        }
        if (usedTargets.has(contractId))
          issues.push('target-used-by-another-legacy-row')
        usedTargets.add(contractId)
        if (current.userId !== source.userId) issues.push('owner')
        if (current.name !== source.name) issues.push('name')
        if (current.type !== (legacyType === 'Loan' ? 'LOAN' : 'SUBSCRIPTION'))
          issues.push('type')
        const periods = (
          await client.query(
            'SELECT * FROM "Period" WHERE "contractId" = $1 ORDER BY "from", id',
            [contractId]
          )
        ).rows
        // A legacy row cannot prove equivalence to an evolved multi-period history.
        if (periods.length !== 1) issues.push('period-history-needs-review')
        else {
          const period = periods[0]
          if (cents(period.fee) !== cents(source.fee)) issues.push('period-fee')
          if (legacyType === 'Loan') {
            if (cents(current.fee ?? 0) !== cents(source.initial))
              issues.push('initial')
            if (
              day(period.from) !== day(source.startDate) ||
              day(period.to) !== day(source.endDate)
            )
              issues.push('date-range')
            if (period.payday !== new Date(source.startDate).getUTCDate())
              issues.push('payday-needs-review')
          } else {
            issues.push('legacy-start-date-needs-review')
            if (period.payday !== source.payday) issues.push('payday')
            if (period.periodicity !== (source.yearly ? 'YEARLY' : 'MONTHLY'))
              issues.push('periodicity')
            if (source.yearly)
              issues.push('legacy-yearly-month-and-start-date-need-review')
          }
        }
        const legacyShares = (
          await client.query(
            `SELECT "userId" AS "toId", accepted FROM "${legacyType}Share" WHERE "${legacyType === 'Loan' ? 'loanId' : 'subscriptionId'}" = $1`,
            [source.id]
          )
        ).rows
        const shares = (
          await client.query(
            'SELECT "toId", accepted, "fromId" FROM "Share" WHERE "contractId" = $1',
            [contractId]
          )
        ).rows
        if (shares.some((share) => share.fromId !== source.userId))
          issues.push('share-sender')
        if (
          !same(
            normalize(legacyShares),
            normalize(shares.map(({ toId, accepted }) => ({ toId, accepted })))
          )
        )
          issues.push('recipients-or-acceptance')
        const providers = []
        for (const role of [
          'vendor',
          'platform',
          ...(legacyType === 'Loan' ? ['lender'] : [])
        ]) {
          if (!source[`${role}Id`]) continue
          const relation = (
            await client.query(
              'SELECT "providerId", "userId" FROM "UserProvider" WHERE id = $1',
              [source[`${role}Id`]]
            )
          ).rows[0]
          if (!relation || relation.userId !== source.userId)
            issues.push(`legacy-${role}-relation`)
          if (relation)
            providers.push({
              as: role.toUpperCase(),
              providerId: relation.providerId
            })
        }
        const currentProviders = (
          await client.query(
            'SELECT "as", "providerId" FROM "ProvidersOnContract" WHERE "contractId" = $1',
            [contractId]
          )
        ).rows
        if (!same(normalize(providers), normalize(currentProviders)))
          issues.push('providers')
        const links = (
          await client.query(
            `SELECT url FROM "Resource" WHERE "contractId" = $1 AND type = 'LINK' AND url <> ''`,
            [contractId]
          )
        ).rows
          .map(({ url }) => url)
          .sort()
        if (!same(links, source.link ? [source.link] : [])) issues.push('links')
        rows.push({ legacyType, legacyId: source.id, contractId, issues })
      }
      cursor = sources.at(-1).id
    }
  }
  const unusedMappings = [...mappings.keys()].filter(
    (key) => !visitedMappings.has(key)
  )
  const exceptions = rows.filter(({ issues }) => issues.length)
  console.log(
    JSON.stringify(
      {
        mode: 'read-only',
        units: types[0].data_type === 'integer' ? 'cents' : 'euros',
        checked: rows.length,
        equivalent: rows.length - exceptions.length,
        exceptions,
        unusedMappings,
        note: 'No rows imported or deleted. Multi-period histories and missing legacy scheduling information require manual review. Equality does not authorize retirement.'
      },
      null,
      2
    )
  )
  if (exceptions.length || unusedMappings.length) process.exitCode = 2
} catch {
  console.error(
    'Legacy reconciliation failed; inspect connection/schema/mapping privately. No writes were made.'
  )
  process.exitCode = 1
} finally {
  await client.query('ROLLBACK').catch(() => {})
  await client.end().catch(() => {})
}
