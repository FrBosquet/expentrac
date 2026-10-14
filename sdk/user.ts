import { user } from './decode'
import { arrayOf, request } from './http'

export const getUsersByEmail = async (search: string, signal?: AbortSignal) =>
  request(
    `user?search=${encodeURIComponent(search)}`,
    { signal },
    arrayOf(user)
  )
export const userSdk = { find: getUsersByEmail }
