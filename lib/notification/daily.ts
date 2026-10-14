import { emailSdk } from '@lib/email'
import { type Contract, type Prisma, prisma, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'

export interface DailyNotification {
  type: NOTIFICATION_TYPE.DAILY
  loans: Contract[]
  subs: Contract[]
  day: string
}

export interface DailyNotificationPayload {
  loans: Contract[]
  subs: Contract[]
}

export const handleDaily = async (
  user: User,
  shouldEmail: boolean,
  data: DailyNotification,
  db: Prisma.TransactionClient = prisma
) => {
  const payload: DailyNotificationPayload = {
    loans: data.loans,
    subs: data.subs
  }

  const notification = await db.notification.create({
    data: {
      id: `daily/${user.id}/${data.day}`,
      user: {
        connect: { id: user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.DAILY,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendDailyEmail(
      user.email,
      user.name!,
      data.loans,
      data.subs,
      db,
      notification.id
    )
  }

  return notification
}
