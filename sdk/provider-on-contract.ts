import { getUrl } from '@lib/api'
import { type ProviderOnContract } from '@lib/models'

export const getUserProviderOnContracts = async (userId: string) => {
  const url = getUrl(`provider-on-contract?userId=${userId}`)

  const response = await fetch(url, { cache: 'no-store' })
  const contracts: ProviderOnContract[] = await response.json()

  return contracts
}

export const providerOnContractSdk = {
  get: getUserProviderOnContracts
}
