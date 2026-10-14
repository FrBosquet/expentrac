import { type SubFormData } from '@lib/sub'

import { contract } from './decode'
import { arrayOf, envelope, request } from './http'

export const getUserSubscriptions = async (
  _userId?: string,
  signal?: AbortSignal
) => request('contract?type=SUBSCRIPTION', { signal }, arrayOf(contract))
const create = async (body: SubFormData) =>
  request(
    'subscription',
    { method: 'POST', body: JSON.stringify(body) },
    envelope(contract)
  )
const update = async (id: string, body: SubFormData) =>
  request(
    `subscription/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify(body) },
    envelope(contract)
  )
const deleteSub = async (id: string) =>
  request(
    `contract/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    envelope((value) => {
      if (
        !value ||
        typeof value !== 'object' ||
        !('id' in value) ||
        typeof value.id !== 'string'
      )
        throw new Error('Invalid deletion')
      return value as { id: string }
    })
  )
export const subscriptionSdk = {
  get: getUserSubscriptions,
  create,
  update,
  delete: deleteSub
}
