import { type User } from '@prisma/client'
import { NOTIFICATION_TYPE } from '@types'
import { emailSdk } from '../email'
import { prisma } from '../prisma'

export interface GenericNotificationPayload {
  type: NOTIFICATION_TYPE.GENERIC
  message: string
}

export const handleGeneric = async (user: User, shouldEmail: boolean, payload: GenericNotificationPayload) => {
  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: user.id }
      },
      payload: { message: payload.message },
      type: NOTIFICATION_TYPE.GENERIC,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendGenericEmail(user.email, user.name as string, payload.message)
  }

  return notification
}
