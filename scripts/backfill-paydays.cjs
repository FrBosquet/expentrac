// Invoke with node --import tsx. No .env loading; dry-run by default.
const { PrismaClient } = require('../generated/prisma/client.ts')
const { PrismaPg } = require('@prisma/adapter-pg')
const args = process.argv.slice(2)
if (args.some((arg) => arg !== '--apply'))
  throw new Error(
    'Usage: node --import tsx scripts/backfill-paydays.cjs [--apply]'
  )
const apply = args.includes('--apply')
if (!process.env.EXPENTRAC_MIGRATION_URL)
  throw new Error('Set EXPENTRAC_MIGRATION_URL explicitly')
if (
  apply &&
  (process.env.EXPENTRAC_MAINTENANCE_CONFIRMED !== 'true' ||
    process.env.EXPENTRAC_RESTORE_REHEARSED !== 'true')
)
  throw new Error(
    'Apply requires maintenance and rehearsed backup recovery; see money-migration.md'
  )
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.EXPENTRAC_MIGRATION_URL,
    max: 1
  })
})
const calendarDay = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Madrid',
  day: 'numeric'
})
async function main() {
  let cursor = '',
    checked = 0,
    updated = 0
  const proposedByDay = {}
  while (true) {
    const periods = await prisma.period.findMany({
      where: { payday: null, id: { gt: cursor } },
      orderBy: { id: 'asc' },
      take: 100,
      select: { id: true, from: true }
    })
    if (!periods.length) break
    for (const period of periods) {
      const payday = Number(calendarDay.format(period.from))
      proposedByDay[payday] = (proposedByDay[payday] ?? 0) + 1
      checked++
      if (apply)
        updated += (
          await prisma.period.updateMany({
            where: { id: period.id, payday: null },
            data: { payday }
          })
        ).count
    }
    cursor = periods.at(-1).id
  }
  console.log(
    JSON.stringify({
      mode: apply ? 'apply' : 'dry-run',
      checked,
      updated,
      proposedByDay
    })
  )
}
main()
  .catch(() => {
    console.error(
      'Payday backfill failed; inspect the selected database privately'
    )
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
