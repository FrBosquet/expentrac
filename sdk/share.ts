import { share } from './decode'
import { arrayOf, envelope, request } from './http'

const getUserShares = async (userId?: string, signal?: AbortSignal) =>
  request(
    `share?${userId ? `userId=${encodeURIComponent(userId)}` : ''}`,
    { signal },
    arrayOf(share)
  )
const updateShare = async (id: string, accepted: boolean) =>
  request(
    `share/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify({ accepted }) },
    envelope(share)
  )
export const shareSdk = { get: getUserShares, update: updateShare }
