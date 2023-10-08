import { getTag, getUrl } from '@lib/api'
import { type User } from '@lib/prisma'

export const getUsersByEmail = async (search: string) => {
  const url = getUrl(`user?search=${search}`)

  const response = await fetch(url, { next: { tags: [getTag('search', search)] } })
  const users: User[] = await response.json()

  return users
}

export const userSdk = {
  find: getUsersByEmail
}
