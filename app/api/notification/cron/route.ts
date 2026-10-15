import { CONTRACT_TYPE } from '@lib/contract'
import { notificationSdk } from '@lib/notification'
import { type Contract, prisma } from '@lib/prisma'
import { deliverOutbox } from '@lib/server/outbox'
import { madridDay, paymentDayMatches } from '@lib/server/payment-day'
import { NOTIFICATION_TYPE } from '@types'
import { assertDatabaseReady } from '@lib/server/schema-state'
import { NextResponse } from 'next/server'

export const revalidate = 0
export const GET = async (req: Request) => {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  await assertDatabaseReady()
  const day = madridDay(new Date())
  const periods = await prisma.period.findMany({
    where: {
      contract: {
        type: { in: [CONTRACT_TYPE.LOAN, CONTRACT_TYPE.SUBSCRIPTION] }
      }
    },
    orderBy: { from: 'desc' },
    include: {
      contract: {
        include: {
          user: true,
          shares: {
            include: { to: { select: { id: true, name: true, image: true } } }
          },
          periods: true,
          providers: { include: { provider: true } },
          resources: true
        }
      }
    }
  })
  const users = new Map<string, { loans: Contract[]; subs: Contract[] }>()
  const contracts = new Set<string>()
  for (const period of periods) {
    if (!paymentDayMatches(period, day) || contracts.has(period.contractId))
      continue
    contracts.add(period.contractId)
    const { contract } = period
    const items = users.get(contract.userId) ?? { loans: [], subs: [] }
    const target =
      contract.type === CONTRACT_TYPE.LOAN ? items.loans : items.subs
    target.push(contract as Contract)
    users.set(contract.userId, items)
  }
  let queued = 0
  for (const [userId, items] of Array.from(users)) {
    const id = `daily/${userId}/${day}`
    if (await prisma.notification.findUnique({ where: { id } })) continue
    try {
      await notificationSdk.create(userId, true, {
        type: NOTIFICATION_TYPE.DAILY,
        ...items,
        day
      })
      queued++
    } catch (error) {
      // A concurrent cron may have won the unique-id insert. Other failures must surface.
      if (!(
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ))
        throw error
    }
  }
  const delivery = await deliverOutbox()
  await prisma.notification.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 30 * 86_400_000) } }
  })
  await prisma.invitationEvent.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 86_400_000) } }
  })
  return NextResponse.json({ day, queued, users: users.size, delivery })
}
