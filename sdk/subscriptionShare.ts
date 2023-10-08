import { getUrl } from '@lib/api'
import { type SubscriptionShareComplete } from '@types'

export const getUserSubscriptionShares = async (userId: string) => {
  const url = getUrl(`subscription-share?userId=${userId}`)

  const response = await fetch(url)

  const shares: SubscriptionShareComplete[] = await response.json()

  return shares
}

export const updateSubscriptionShare = async (id: string, accepted: boolean): Promise<SubscriptionShareComplete> => {
  const url = getUrl('subscription-share')

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify({ id, accepted })
  })

  const { data } = await response.json()

  return data
}

export const deleteSubscriptionShare = async (id: string) => {
  const url = getUrl(`subscription-share?id=${id}`)

  await fetch(url, { method: 'DELETE' })
}

export const subscriptionShareSdk = {
  get: getUserSubscriptionShares,
  update: updateSubscriptionShare,
  delete: deleteSubscriptionShare
}
