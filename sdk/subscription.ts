import { getTag, getUrl } from '@lib/api'
import { CONTRACT_TYPE } from '@lib/contract'
import { type SubscriptionComplete } from '@types'

export const getUserSubscriptions = async (userId: string) => {
  const url = getUrl(`contract?userId=${userId}&type=${CONTRACT_TYPE.SUBSCRIPTION}`)

  const response = await fetch(url, { next: { tags: [`subscription:${userId}`] } })
  const subscriptions: SubscriptionComplete[] = await response.json()

  return subscriptions
}

export const revalidateUserSubscriptions = async (userId: string) => {
  const url = getUrl(`revalidate?tag=${getTag('subscription', userId)}&secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}`)

  const response = await fetch(url, { method: 'POST' })

  return response
}

export const updateSubscription = async (body: Record<string, unknown>) => {
  const result = await fetch(getUrl('/subscription'), {
    method: 'PATCH',
    body: JSON.stringify(body)
  })

  const { data } = await result.json() as { data: SubscriptionComplete }

  return data
}

export const subscriptionSdk = {
  get: getUserSubscriptions,
  revalidate: revalidateUserSubscriptions,
  update: updateSubscription
}
