import { emailSdk } from '@lib/email'
import { prisma, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE, type SubscriptionComplete } from '@types'

export interface SubShareAcceptNotification {
  type: NOTIFICATION_TYPE.SUB_SHARE_ACCEPTED
  sub: SubscriptionComplete
}

export interface SubShareAcceptNotificationPayload {
  sub: SubscriptionComplete
  shareHolder: User
}

export const handleSubShareAccept = async (user: User, shouldEmail: boolean, sub: SubscriptionComplete) => {
  const payload: SubShareAcceptNotificationPayload = {
    sub,
    shareHolder: user
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: sub.user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.SUB_SHARE_ACCEPTED,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendSubShareAcceptance(user.name as string, sub)
  }

  return notification
}
