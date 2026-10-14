// Run only against a disposable database after reviewing the proposed changes.
const { PrismaClient } = require("@prisma/client");
if (process.env.ALLOW_OFFLINE_MAINTENANCE !== "true") {
  throw new Error(
    "Set ALLOW_OFFLINE_MAINTENANCE=true for an explicitly selected database",
  );
}
const prisma = new PrismaClient();
async function main() {
  const periods = await prisma.period.findMany({ where: { payday: null } });
  for (const period of periods) {
    await prisma.period.update({
      where: { id: period.id },
      data: { payday: period.from.getUTCDate() },
    });
  }
  console.log({ updated: periods.length });
}
main()
  .catch(() => {
    console.error("Backfill failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
