import { getUrl } from '@lib/api'
import { type Contract } from '@lib/prisma'

export const getUserContracts = async (userId: string) => {
  const url = getUrl(`contract?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [`subscription:${userId}`] } })
  const contracts: Contract[] = await response.json()

  return contracts
}

export const contractSdk = {
  get: getUserContracts
}
