import { prisma } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'
import { handleDaily, type DailyNotification } from './daily'
import { handleGeneric, type GenericNotification } from './generic'
import { handleLoanShare, type LoanShareNotification } from './loan-share'
import { handleLoanShareAccept, type LoanShareAcceptNotification } from './loan-share-accept'
import { handleLoanShareReject, type LoanShareRejectionNotification } from './loan-share-reject'
import { handleSubsShare, type SubShareNotification } from './sub-share'
import { handleSubShareAccept, type SubShareAcceptNotification } from './sub-share-accept'
import { handleSubShareReject, type SubShareRejectNotification } from './sub-share-reject'

type NotificationData =
  GenericNotification |
  LoanShareNotification |
  LoanShareAcceptNotification |
  LoanShareRejectionNotification |
  SubShareNotification |
  SubShareAcceptNotification |
  SubShareRejectNotification |
  DailyNotification

const create = async (userId: string, shouldEmail: boolean, data: NotificationData) => {
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
    case NOTIFICATION_TYPE.LOAN_SHARE: {
      return await handleLoanShare(user, shouldEmail, data.contract, data.share)
    }
    case NOTIFICATION_TYPE.LOAN_SHARE_ACCEPTED: {
      return await handleLoanShareAccept(user, shouldEmail, data.contract)
    }
    case NOTIFICATION_TYPE.LOAN_SHARE_REJECTED: {
      return await handleLoanShareReject(user, shouldEmail, data.contract)
    }
    case NOTIFICATION_TYPE.SUB_SHARE: {
      return await handleSubsShare(user, shouldEmail, data.contract, data.share)
    }
    case NOTIFICATION_TYPE.SUB_SHARE_ACCEPTED: {
      return await handleSubShareAccept(user, shouldEmail, data.contract)
    }
    case NOTIFICATION_TYPE.SUB_SHARE_REJECTED: {
      return await handleSubShareReject(user, shouldEmail, data.contract)
    }
    case NOTIFICATION_TYPE.DAILY: {
      return await handleDaily(user, shouldEmail, data)
    }
  }
}

export const notificationSdk = {
  create
}
