import { getUrl } from "@lib/api"
import { Subscription } from "@prisma/client"
import { LoanComplete, UserProviderComplete } from "@types"

export const getUserProviders = async (userId: string) => {
  const url = getUrl(`user-provider?userId=${userId}`)

  const response = await fetch(url, { credentials: 'include' })
  const subscriptions: UserProviderComplete[] = await response.json()

  return subscriptions
}

export const getUserLoans = async (userId: string) => {
  const url = getUrl(`loan?userId=${userId}`)

  const response = await fetch(url, { credentials: 'include' })
  const loans: LoanComplete[] = await response.json()

  return loans
}

export const getUserSubscriptions = async (userId: string) => {
  const url = getUrl(`subscription?userId=${userId}`)

  const response = await fetch(url, { credentials: 'include' })
  const subscriptions: Subscription[] = await response.json()

  return subscriptions
}
