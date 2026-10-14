import { providerRelation } from './decode'
import { arrayOf, request } from './http'

export const getUserProviderOnContracts = async (
  userId?: string,
  signal?: AbortSignal
) =>
  request(
    `provider-on-contract?${userId ? `userId=${encodeURIComponent(userId)}` : ''}`,
    { signal },
    arrayOf(providerRelation)
  )
export const providerOnContractSdk = { get: getUserProviderOnContracts }
