import { providerRelation } from './decode'
import { arrayOf, request } from './http'

export const getUserProviderOnContracts = async (
  _userId?: string,
  signal?: AbortSignal
) => request('provider-on-contract', { signal }, arrayOf(providerRelation))
export const providerOnContractSdk = { get: getUserProviderOnContracts }
