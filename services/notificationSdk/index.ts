import { NOTIFICATION_TYPE } from '@types'
import { prisma } from '../prisma'
import { handleGeneric, type GenericNotificationPayload } from './generic'

type Payload = GenericNotificationPayload

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
    default:
      throw new Error(`Unknown notification type: ${payload.type}`)
  }
}

export const notificationSdk = {
  createNotification
}
