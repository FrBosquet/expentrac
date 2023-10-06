import { getUrl } from '@lib/api'
import { type Notification } from '@prisma/client'

export const getUserNotifications = async (userId: string) => {
  const url = getUrl(`notification?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [`notification:${userId}`] } })
  const notifications: Notification = await response.json()

  return notifications
}
