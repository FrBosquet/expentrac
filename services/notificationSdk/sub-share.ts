import { type SubscriptionShare, type User } from '@prisma/client'
import { NOTIFICATION_TYPE, SHARE_STATE, type SubscriptionComplete } from '@types'
import { emailSdk } from '../email'
import { prisma } from '../prisma'

export interface SubShareNotification {
  type: NOTIFICATION_TYPE.SUB_SHARES
  sub: SubscriptionComplete
  subShare: SubscriptionShare
}

export interface SubShareNotificationPayload {
  sub: SubscriptionComplete
  subShare: SubscriptionShare
  state: SHARE_STATE
}

export const handleSubsShare = async (user: User, shouldEmail: boolean, sub: SubscriptionComplete, subShare: SubscriptionShare) => {
  const payload: SubShareNotificationPayload = {
    sub,
    subShare,
    state: SHARE_STATE.PENDING
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: user.id }
      },
      payload: JSON.stringify(payload),
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
