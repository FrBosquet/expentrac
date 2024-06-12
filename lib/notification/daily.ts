import { emailSdk } from '@lib/email'
import { type Contract, prisma, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'

export interface DailyNotification {
  type: NOTIFICATION_TYPE.DAILY
  loans: Contract[]
  subs: Contract[]
}

export interface DailyNotificationPayload {
  loans: Contract[]
  subs: Contract[]
}

export const handleDaily = async (
  user: User,
  shouldEmail: boolean,
  data: DailyNotification
) => {
  const payload: DailyNotificationPayload = {
    loans: data.loans,
    subs: data.subs
  }

  const notification = await prisma.notification.create({
    data: {
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
    await emailSdk.sendDailyEmail(user.email, user.name!, data.loans, data.subs)
  }

  return notification
}
