import { NOTIFICATION_TYPE } from '@types'
import { prisma } from '../prisma'
import { handleGeneric, type GenericNotification } from './generic'
import { handleLoanShare, type LoanShareNotification } from './loan-share'
import { handleSubsShare, type SubShareNotification } from './sub-share'

type NotificationData = GenericNotification | LoanShareNotification | SubShareNotification

const createNotification = async (userId: string, shouldEmail: boolean, data: NotificationData) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user) throw new Error(`Generating notification, no user found for id: ${userId}`)

  const { type } = data

  switch (type) {
    case NOTIFICATION_TYPE.GENERIC: {
      return await handleGeneric(user, shouldEmail, data)
    }
    case NOTIFICATION_TYPE.LOAN_SHARES: {
      return await handleLoanShare(user, shouldEmail, data.loan, data.loanShare)
    }
    case NOTIFICATION_TYPE.SUB_SHARES: {
      return await handleSubsShare(user, shouldEmail, data.sub, data.subShare)
    }
    default:
      throw new Error('Unknown notification type')
  }
}

export const notificationSdk = {
  createNotification
}
