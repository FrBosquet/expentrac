import { getTag, getUrl } from '@lib/api'
import { CONTRACT_TYPE } from '@lib/contract'
import { type Contract } from '@lib/models'
import { type SubFormData } from '@lib/sub'

export const getUserSubscriptions = async (userId: string) => {
  const url = getUrl(
    `contract?userId=${userId}&type=${CONTRACT_TYPE.SUBSCRIPTION}`
  )

  const response = await fetch(url, { cache: 'no-store' })
  const subscriptions: Contract[] = await response.json()

  return subscriptions
}

const create = async (body: SubFormData) => {
  const result = await fetch(getUrl('/subscription'), {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const { data } = (await result.json()) as { data: Contract }
  return data
}

const update = async (id: string, body: SubFormData) => {
  const result = await fetch(getUrl(`/subscription/${id}`), {
    method: 'PATCH',
    body: JSON.stringify(body)
  })

  const { data } = (await result.json()) as { data: Contract }
  return data
}

const deleteSub = async (id: string) => {
  const result = await fetch(getUrl(`/contract/${id}`), {
    method: 'DELETE'
  })

  const { data } = (await result.json()) as { data: Contract }
  return data
}

export const subscriptionSdk = {
  get: getUserSubscriptions,
  create,
  update,
  delete: deleteSub
}
