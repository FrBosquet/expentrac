import { contract } from './decode'
import { allPages, request } from './http'
import { type CONTRACT_TYPE } from '@lib/contract'

export const getUserContracts = async (
  userId?: string,
  signal?: AbortSignal,
  type?: CONTRACT_TYPE
) =>
  allPages(
    `contract?${userId ? `userId=${encodeURIComponent(userId)}` : ''}${type ? `&type=${encodeURIComponent(type)}` : ''}`,
    contract,
    signal
  )
export const contractSdk = { get: getUserContracts }
