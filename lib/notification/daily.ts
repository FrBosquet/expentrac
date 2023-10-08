import { emailSdk } from '@lib/email'
import { prisma, type Loan, type Subscription, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'

export interface DailyNotification {
  type: NOTIFICATION_TYPE.DAILY
  loans: Loan[]
  subscriptions: Subscription[]
}

export interface DailyNotificationPayload {
  loans: Loan[]
  subscriptions: Subscription[]
}

export const handleDaily = async (user: User, shouldEmail: boolean, data: DailyNotification) => {
  const payload: DailyNotificationPayload = {
    loans: data.loans,
    subscriptions: data.subscriptions
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
    await emailSdk.sendDailyEmail(user.email, user.name as string, data.loans, data.subscriptions)
  }

  return notification
}
