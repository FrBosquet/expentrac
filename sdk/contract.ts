import { contract } from './decode'
import { arrayOf, request } from './http'

export const getUserContracts = async (
  _userId?: string,
  signal?: AbortSignal
) => request('contract', { signal }, arrayOf(contract))
export const contractSdk = { get: getUserContracts }
