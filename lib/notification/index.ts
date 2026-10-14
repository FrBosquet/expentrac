import { prisma } from '@lib/prisma'
import { deliverOutbox } from '@lib/server/outbox'
import { NOTIFICATION_TYPE } from '@types'

import { type DailyNotification, handleDaily } from './daily'
import { type GenericNotification, handleGeneric } from './generic'
import { handleLoanShare, type LoanShareNotification } from './loan-share'
import {
  handleLoanShareAccept,
  type LoanShareAcceptNotification
} from './loan-share-accept'
import {
  handleLoanShareReject,
  type LoanShareRejectionNotification
} from './loan-share-reject'
import { handleSubsShare, type SubShareNotification } from './sub-share'
import {
  handleSubShareAccept,
  type SubShareAcceptNotification
} from './sub-share-accept'
import {
  handleSubShareReject,
  type SubShareRejectNotification
} from './sub-share-reject'

type NotificationData =
  | GenericNotification
  | LoanShareNotification
  | LoanShareAcceptNotification
  | LoanShareRejectionNotification
  | SubShareNotification
  | SubShareAcceptNotification
  | SubShareRejectNotification
  | DailyNotification

const create = async (
  userId: string,
  shouldEmail: boolean,
  data: NotificationData
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user)
    throw new Error(`Generating notification, no user found for id: ${userId}`)

  const { type } = data

  const notification = await prisma.$transaction(async (db) => {
    switch (type) {
      case NOTIFICATION_TYPE.GENERIC: {
        return await handleGeneric(user, shouldEmail, data, db)
      }
      case NOTIFICATION_TYPE.LOAN_SHARE: {
        return await handleLoanShare(
          user,
          shouldEmail,
          data.contract,
          data.share,
          db
        )
      }
      case NOTIFICATION_TYPE.LOAN_SHARE_ACCEPTED: {
        return await handleLoanShareAccept(user, shouldEmail, data.contract, db)
      }
      case NOTIFICATION_TYPE.LOAN_SHARE_REJECTED: {
        return await handleLoanShareReject(user, shouldEmail, data.contract, db)
      }
      case NOTIFICATION_TYPE.SUB_SHARE: {
        return await handleSubsShare(
          user,
          shouldEmail,
          data.contract,
          data.share,
          db
        )
      }
      case NOTIFICATION_TYPE.SUB_SHARE_ACCEPTED: {
        return await handleSubShareAccept(user, shouldEmail, data.contract, db)
      }
      case NOTIFICATION_TYPE.SUB_SHARE_REJECTED: {
        return await handleSubShareReject(user, shouldEmail, data.contract, db)
      }
      case NOTIFICATION_TYPE.DAILY: {
        return await handleDaily(user, shouldEmail, data, db)
      }
    }
  })
  if (notification && shouldEmail) {
    try {
      await deliverOutbox(notification.id)
    } catch {
      // eslint-disable-next-line no-console -- operational failure without recipient or payload
      console.error('Email delivery deferred; outbox retains pending work')
    }
  }
  return notification
}

export const notificationSdk = {
  create
}
