import { getUrl } from '@lib/api'
import { type Share } from '@lib/prisma'

const getUserShares = async (userId: string) => {
  const url = getUrl(`share?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [`loan:${userId}`] } })
  const shares: Share[] = await response.json()

  return shares
}

const updateShare = async (id: string, accepted: boolean): Promise<Share> => {
  const url = getUrl(`share/${id}`)

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify({ accepted })
  })

  const { data } = await response.json()

  return data
}

export const shareSdk = {
  get: getUserShares,
  update: updateShare
}
