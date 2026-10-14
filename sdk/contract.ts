import { contract } from './decode'
import { allPages, request } from './http'

export const getUserContracts = async (userId?: string, signal?: AbortSignal) =>
  allPages(
    `contract?${userId ? `userId=${encodeURIComponent(userId)}` : ''}`,
    contract,
    signal
  )
export const contractSdk = { get: getUserContracts }
