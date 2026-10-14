import { share } from './decode'
import { allPages, envelope, request } from './http'

const getUserShares = async (userId?: string, signal?: AbortSignal) =>
  allPages(
    `share?${userId ? `userId=${encodeURIComponent(userId)}` : ''}`,
    share,
    signal
  )
const updateShare = async (id: string, accepted: boolean) =>
  request(
    `share/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify({ accepted }) },
    envelope(share)
  )
export const shareSdk = { get: getUserShares, update: updateShare }
