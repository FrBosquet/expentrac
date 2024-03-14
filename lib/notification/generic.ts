import { emailSdk } from '@lib/email'
import { prisma, type User } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'

export interface GenericNotification {
  type: NOTIFICATION_TYPE.GENERIC
  message: string
}

export interface GenericNotificationPayload {
  message: string
}

export const handleGeneric = async (user: User, shouldEmail: boolean, data: GenericNotification) => {
  const payload: GenericNotificationPayload = {
    message: data.message
  }

  const notification = await prisma.notification.create({
    data: {
      user: {
        connect: { id: user.id }
      },
      payload: JSON.stringify(payload),
      type: NOTIFICATION_TYPE.GENERIC,
      ack: false,
      date: new Date().toISOString()
    }
  })

  if (shouldEmail && user.email) {
    await emailSdk.sendGenericEmail(user.email, user.name!, data.message)
  }

  return notification
}
