import { getUrl } from '@lib/api'
import { type Notification } from '@lib/prisma'
import { type SHARE_STATE } from '@types'

const get = async (userId: string) => {
  const url = getUrl(`notification?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [`notification:${userId}`] } })
  const notifications: Notification[] = await response.json()

  return notifications
}

const ack = async (id: string, state?: SHARE_STATE) => {
  const url = getUrl(`notification/${id}`)

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify({
      ack: true,
      state
    })
  })

  const { notification } = await response.json()

  return notification as Notification
}

export const notificationSdk = {
  get,
  ack
}
