import { emailSdk } from '@lib/email'
import { prisma, type Contract, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'

export interface SubShareAcceptNotification {
  type: NOTIFICATION_TYPE.SUB_SHARE_ACCEPTED
  contract: Contract
}

export interface SubShareAcceptNotificationPayload {
  contract: Contract
  user: User
}

export const handleSubShareAccept = async (user: User, shouldEmail: boolean, contract: Contract) => {
  const payload: SubShareAcceptNotificationPayload = {
    contract,
    user
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: contract.user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.SUB_SHARE_ACCEPTED,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendSubShareAcceptance(user.name!, contract)
  }

  return notification
}
