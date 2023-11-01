import { emailSdk } from '@lib/email'
import { type Contract, prisma, type Share, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE, SHARE_STATE } from '@types'

export interface SubShareNotification {
  type: NOTIFICATION_TYPE.SUB_SHARE
  contract: Contract
  share: Share
}

export interface SubShareNotificationPayload {
  contract: Contract
  share: Share
  state: SHARE_STATE
}

export const handleSubsShare = async (user: User, shouldEmail: boolean, contract: Contract, share: Share) => {
  const payload: SubShareNotificationPayload = {
    contract,
    share,
    state: SHARE_STATE.PENDING
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.SUB_SHARE,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendSubShare(user.email, user.name as string, contract)
  }

  return notification
}
