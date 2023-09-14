import { getTag, getUrl } from '@lib/api'
import { type Subscription } from '@prisma/client'

export const getUserSubscriptions = async (userId: string) => {
  const url = getUrl(`subscription?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [`subscription:${userId}`] } })
  const subscriptions: Subscription[] = await response.json()

  return subscriptions
}

export const revalidateUserSubscriptions = async (userId: string) => {
  const url = getUrl(`revalidate?tag=${getTag('subscription', userId)}&secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}`)

  const response = await fetch(url, { method: 'POST' })

  return response
}
