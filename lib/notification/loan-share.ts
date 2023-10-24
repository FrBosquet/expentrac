import { emailSdk } from '@lib/email'
import { prisma, type Contract, type Share, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE, SHARE_STATE } from '@types'

export interface LoanShareNotification {
  type: NOTIFICATION_TYPE.LOAN_SHARE
  contract: Contract
  share: Share
}

// TODO: Adding the whole loan would flood the notification table with data. Add a cron job to clean up every week or so.
// Also, the info is outdated. Check if we can conditionally add the loan info.
export interface LoanShareNotificationPayload {
  contract: Contract
  share: Share
  state: SHARE_STATE
}

export const handleLoanShare = async (user: User, shouldEmail: boolean, contract: Contract, share: Share) => {
  const payload: LoanShareNotificationPayload = {
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
      type: NOTIFICATION_TYPE.LOAN_SHARE,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendLoanShare(user.email, user.name as string, contract)
  }

  return notification
}
