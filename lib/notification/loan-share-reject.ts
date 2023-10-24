import { emailSdk } from '@lib/email'
import { type Contract, prisma, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'

export interface LoanShareRejectionNotification {
  type: NOTIFICATION_TYPE.LOAN_SHARE_REJECTED
  contract: Contract
}

export interface LoanShareRejectionNotificationPayload {
  contract: Contract
  shareHolder: User
}

export const handleLoanShareReject = async (user: User, shouldEmail: boolean, contract: Contract) => {
  const payload: LoanShareRejectionNotificationPayload = {
    contract,
    shareHolder: user
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: contract.user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.LOAN_SHARE_REJECTED,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendLoanShareRejection(user.name as string, contract)
  }

  return notification
}
