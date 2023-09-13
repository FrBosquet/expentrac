import { getTag, getUrl } from '@lib/api'
import { type User } from '@prisma/client'

export const getUsersByEmail = async (search: string) => {
  const url = getUrl(`user?search=${search}`)

  const response = await fetch(url, { next: { tags: [getTag('search', search)] } })
  const users: User[] = await response.json()

  return users
}
