import { emailSdk } from '@lib/email'
import { type Contract, prisma, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'

export interface SubShareRejectNotification {
  type: NOTIFICATION_TYPE.SUB_SHARE_REJECTED
  contract: Contract
}

export interface SubShareRejectNotificationPayload {
  contract: Contract
  user: User
}

export const handleSubShareReject = async (
  user: User,
  shouldEmail: boolean,
  contract: Contract
) => {
  const payload: SubShareRejectNotificationPayload = {
    contract,
    user
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: contract.user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.SUB_SHARE_REJECTED,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendSubShareRejection(user.name!, contract)
  }

  return notification
}
