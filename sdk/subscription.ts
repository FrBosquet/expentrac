import { getTag, getUrl } from '@lib/api'
import { CONTRACT_TYPE } from '@lib/contract'
import { type Contract } from '@lib/prisma'
import { type SubFormData } from '@lib/sub'

export const getUserSubscriptions = async (userId: string) => {
  const url = getUrl(`contract?userId=${userId}&type=${CONTRACT_TYPE.SUBSCRIPTION}`)

  const response = await fetch(url, { next: { tags: [`subscription:${userId}`] } })
  const subscriptions: Contract[] = await response.json()

  return subscriptions
}

export const create = async (body: SubFormData) => {
  const result = await fetch(getUrl('/subscription'), {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const { data } = await result.json() as { data: Contract }
  return data
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

  const { data } = await result.json() as { data: Contract }

  return data
}

export const subscriptionSdk = {
  get: getUserSubscriptions,
  create,
  revalidate: revalidateUserSubscriptions,
  update: updateSubscription
}
