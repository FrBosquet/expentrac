import { emailSdk } from '@lib/email'
import { prisma, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE, type SubscriptionComplete } from '@types'

export interface SubShareRejectNotification {
  type: NOTIFICATION_TYPE.SUB_SHARE_REJECTED
  sub: SubscriptionComplete
}

export interface SubShareRejectNotificationPayload {
  sub: SubscriptionComplete
  shareHolder: User
}

export const handleSubShareReject = async (user: User, shouldEmail: boolean, sub: SubscriptionComplete) => {
  const payload: SubShareRejectNotificationPayload = {
    sub,
    shareHolder: user
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: sub.user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.SUB_SHARE_REJECTED,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendSubShareRejection(user.name as string, sub)
  }

  return notification
}
