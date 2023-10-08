import { emailSdk } from '@lib/email'
import { prisma, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE, type LoanComplete } from '@types'

export interface LoanShareRejectionNotification {
  type: NOTIFICATION_TYPE.LOAN_SHARE_REJECTED
  loan: LoanComplete
}

export interface LoanShareRejectionNotificationPayload {
  loan: LoanComplete
  shareHolder: User
}

export const handleLoanShareReject = async (user: User, shouldEmail: boolean, loan: LoanComplete) => {
  const payload: LoanShareRejectionNotificationPayload = {
    loan,
    shareHolder: user
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: loan.user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.LOAN_SHARE_REJECTED,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendLoanShareRejection(user.name as string, loan)
  }

  return notification
}
