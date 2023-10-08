import { emailSdk } from '@lib/email'
import { prisma, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE, type LoanComplete } from '@types'

export interface LoanShareAcceptNotification {
  type: NOTIFICATION_TYPE.LOAN_SHARE_ACCEPTED
  loan: LoanComplete
}

export interface LoanShareAcceptNotificationPayload {
  loan: LoanComplete
  shareHolder: User
}

export const handleLoanShareAccept = async (user: User, shouldEmail: boolean, loan: LoanComplete) => {
  const payload: LoanShareAcceptNotificationPayload = {
    loan,
    shareHolder: user
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: loan.user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.LOAN_SHARE_ACCEPTED,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendLoanShareAcceptance(user.name as string, loan)
  }

  return notification
}
