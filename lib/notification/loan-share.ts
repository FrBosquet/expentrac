import { safeDto } from '@lib/dto'
import { type ContractPreview, contractPreview } from '@lib/dto'
import { emailSdk } from '@lib/email'
import {
  type Contract,
  type Prisma,
  prisma,
  type Share,
  type User
} from '@lib/prisma'
import { NOTIFICATION_TYPE, SHARE_STATE } from '@types'

export interface LoanShareNotification {
  type: NOTIFICATION_TYPE.LOAN_SHARE
  contract: Contract
  share: { id: string }
}

// TODO: Adding the whole loan would flood the notification table with data. Add a cron job to clean up every week or so.
// Also, the info is outdated. Check if we can conditionally add the loan info.
export interface LoanShareNotificationPayload {
  preview: ContractPreview
  share: { id: string }
  state: SHARE_STATE
}

export const handleLoanShare = async (
  user: User,
  shouldEmail: boolean,
  contract: Contract,
  share: { id: string },
  db: Prisma.TransactionClient = prisma
) => {
  const payload: LoanShareNotificationPayload = {
    preview: contractPreview(contract),
    share: { id: share.id },
    state: SHARE_STATE.PENDING
  }

  const notification = await db.notification.create({
    data: {
      user: {
        connect: { id: user.id }
      },
      payload: JSON.stringify(safeDto(payload)),
      type: NOTIFICATION_TYPE.LOAN_SHARE,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendLoanShare(
      user.email,
      user.name!,
      contract,
      db,
      notification.id
    )
  }

  return notification
}
