import { type User } from '@prisma/client'
import { NOTIFICATION_TYPE, SHARE_STATE, type LoanComplete } from '@types'
import { emailSdk } from '../email'
import { prisma } from '../prisma'

export interface LoanShareNotificationPayload {
  type: NOTIFICATION_TYPE.LOAN_SHARES
  loan: LoanComplete
}

export const handleLoanShare = async (user: User, shouldEmail: boolean, loan: LoanComplete) => {
  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: user.id }
      },
      payload: {
        owner: loan.user.id,
        name: loan.name,
        fee: loan.fee,
        state: SHARE_STATE.PENDING
      },
      type: NOTIFICATION_TYPE.LOAN_SHARES,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendLoanShare(user.email, user.name as string, loan)
  }

  return notification
}
