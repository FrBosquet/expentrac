import { getTag, getUrl } from '@lib/api'
import { type User } from '@lib/models'

export const getUsersByEmail = async (search: string) => {
  const url = getUrl(`user?search=${search}`)

  const response = await fetch(url, { cache: 'no-store' })
  const users: User[] = await response.json()

  return users
}

export const userSdk = {
  find: getUsersByEmail
}
