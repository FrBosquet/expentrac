import { getUrl } from '@lib/api'
import { type Share } from '@lib/prisma'

export const getUserShares = async (userId: string) => {
  const url = getUrl(`share?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [`loan:${userId}`] } })
  const shares: Share[] = await response.json()

  return shares
}

export const shareSdk = {
  get: getUserShares
}
