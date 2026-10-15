import { type Prisma } from '@lib/prisma'
import { ApiError } from './api'

// Call inside the same serializable transaction that creates shares and outbox work.
export async function recordInvitations(
  db: Prisma.TransactionClient,
  userId: string,
  count: number
) {
  if (!count) return
  // Serialize callers for this owner, including the empty-history case.
  await db.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`
  const since = new Date(Date.now() - 3_600_000)
  const recent = await db.invitationEvent.count({
    where: { userId, createdAt: { gte: since } }
  })
  if (recent + count > 20)
    throw new ApiError(429, 'Invitation limit reached; try again later')
  await db.invitationEvent.createMany({
    data: Array.from({ length: count }, () => ({ userId }))
  })
}
