import { providerRelation } from './decode'
import { allPages, request } from './http'

export const getUserProviderOnContracts = async (
  userId?: string,
  signal?: AbortSignal
) =>
  allPages(
    `provider-on-contract?${userId ? `userId=${encodeURIComponent(userId)}` : ''}`,
    providerRelation,
    signal
  )
export const providerOnContractSdk = { get: getUserProviderOnContracts }
