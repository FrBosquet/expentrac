import { NOTIFICATION_TYPE } from '@types'
import { prisma } from '../prisma'
import { handleGeneric, type GenericNotificationPayload } from './generic'
import { handleLoanShare, type LoanShareNotificationPayload } from './loan-share'
import { handleSubsShare, type SubShareNotificationPayload } from './sub-share'

type Payload = GenericNotificationPayload | LoanShareNotificationPayload | SubShareNotificationPayload

const createNotification = async (userId: string, shouldEmail: boolean, payload: Payload) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user) throw new Error(`Generating notification, no user found for id: ${userId}`)

  const { type } = payload

  switch (type) {
    case NOTIFICATION_TYPE.GENERIC: {
      return await handleGeneric(user, shouldEmail, payload)
    }
    case NOTIFICATION_TYPE.LOAN_SHARES: {
      return await handleLoanShare(user, shouldEmail, payload.loan)
    }
    case NOTIFICATION_TYPE.SUB_SHARES: {
      return await handleSubsShare(user, shouldEmail, payload.sub)
    }
    default:
      throw new Error('Unknown notification type')
  }
}

export const notificationSdk = {
  createNotification
}
