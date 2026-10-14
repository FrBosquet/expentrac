import { contract } from './decode'
import { arrayOf, request } from './http'

export const getUserContracts = async (userId?: string, signal?: AbortSignal) =>
  request(
    `contract?${userId ? `userId=${encodeURIComponent(userId)}` : ''}`,
    { signal },
    arrayOf(contract)
  )
export const contractSdk = { get: getUserContracts }
