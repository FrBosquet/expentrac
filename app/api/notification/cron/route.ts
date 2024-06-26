import { CONTRACT_TYPE } from '@lib/contract'
import { PERIODICITY } from '@lib/dates'
import { notificationSdk } from '@lib/notification'
import { type Contract, prisma, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'
import { NextResponse } from 'next/server'

export const revalidate = 0
export const GET = async () => {
  const now = Date.now()
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const date = new Date().getDate()

  const users: Record<string, User & { loans: Contract[]; subs: Contract[] }> =
    {}

  const periods = await prisma.period.findMany({
    where: {
      payday: date,
      from: {
        lte: today
      },
      OR: [
        {
          to: null
        },
        {
          to: {
            gte: today
          }
        }
      ]
    },
    include: {
      contract: {
        include: {
          user: true,
          shares: true,
          periods: true,
          providers: true,
          resources: true
        }
      }
    }
  })

  periods.forEach((period) => {
    const { contract, periodicity, paymonth } = period
    const { userId, type } = contract

    if (
      periodicity === PERIODICITY.YEARLY &&
      new Date().getMonth() !== paymonth
    )
      return

    if (!users[userId]) {
      users[userId] = { ...contract.user, loans: [], subs: [] }
    }

    const target =
      type === CONTRACT_TYPE.LOAN ? users[userId].loans : users[userId].subs

    target.push(contract as Contract)
  })

  await Promise.all(
    Object.values(users).map(async (user) => {
      const { loans, subs } = user

      await notificationSdk.create(user.id, true, {
        type: NOTIFICATION_TYPE.DAILY,
        loans,
        subs
      })
    })
  )

  // Clean up older notifications
  const aMonthAgo = new Date()
  aMonthAgo.setMonth(aMonthAgo.getMonth() - 1)

  // using prisma, delete notification with more than a month
  await prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: aMonthAgo
      }
    }
  })

  // done
  return NextResponse.json(
    {
      message: `Job finished in ${Date.now() - now} ms`,
      users
    },
    {
      status: 200
    }
  )
}
