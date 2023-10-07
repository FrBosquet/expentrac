import { type User } from '@prisma/client'
import { NOTIFICATION_TYPE, SHARE_STATE, type SubscriptionComplete } from '@types'
import { emailSdk } from '../email'
import { prisma } from '../prisma'

export interface SubShareNotificationPayload {
  type: NOTIFICATION_TYPE.SUB_SHARES
  sub: SubscriptionComplete
}

export const handleSubsShare = async (user: User, shouldEmail: boolean, sub: SubscriptionComplete) => {
  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: user.id }
      },
      payload: {
        owner: sub.user.id,
        name: sub.name,
        fee: sub.fee,
        state: SHARE_STATE.PENDING
      },
      type: NOTIFICATION_TYPE.SUB_SHARES,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendSubShare(user.email, user.name as string, sub)
  }

  return notification
}
