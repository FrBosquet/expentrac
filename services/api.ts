import { getUrl } from "@lib/api"
import { UserProviderComplete } from "@types"

export const getUserProviders = async (userId: string) => {
  const url = getUrl(`user-provider?userId=${userId}`)

  const response = await fetch(url, { credentials: 'include' })
  const subscriptions: UserProviderComplete[] = await response.json()

  return subscriptions
}