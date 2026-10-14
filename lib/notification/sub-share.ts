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

export interface SubShareNotification {
  type: NOTIFICATION_TYPE.SUB_SHARE
  contract: Contract
  share: { id: string }
}

export interface SubShareNotificationPayload {
  preview: ContractPreview
  share: { id: string }
  state: SHARE_STATE
}

export const handleSubsShare = async (
  user: User,
  shouldEmail: boolean,
  contract: Contract,
  share: { id: string },
  db: Prisma.TransactionClient = prisma
) => {
  const payload: SubShareNotificationPayload = {
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
      type: NOTIFICATION_TYPE.SUB_SHARE,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendSubShare(
      user.email,
      user.name!,
      contract,
      db,
      notification.id
    )
  }

  return notification
}
