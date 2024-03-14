import { emailSdk } from '@lib/email'
import { prisma, type Contract, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'

export interface LoanShareAcceptNotification {
  type: NOTIFICATION_TYPE.LOAN_SHARE_ACCEPTED
  contract: Contract
}

export interface LoanShareAcceptNotificationPayload {
  contract: Contract
  shareHolder: User
}

export const handleLoanShareAccept = async (user: User, shouldEmail: boolean, contract: Contract) => {
  const payload: LoanShareAcceptNotificationPayload = {
    contract,
    shareHolder: user
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: contract.user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.LOAN_SHARE_ACCEPTED,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendLoanShareAcceptance(user.name!, contract)
  }

  return notification
}
