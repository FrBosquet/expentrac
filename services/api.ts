import { getUrl } from "@lib/api"
import { Subscription } from "@prisma/client"
import { LoanComplete, UserProviderComplete } from "@types"

const getTag = (topic: string, userId: string) => `${topic}:${userId}`

export const getUserProviders = async (userId: string) => {
  const url = getUrl(`user-provider?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [getTag('user-provider', userId)] } })
  const subscriptions: UserProviderComplete[] = await response.json()

  return subscriptions
}

export const revalidateUserProviders = async (userId: string) => {
  const url = getUrl(`revalidate?tag=${getTag('user-provider', userId)}&secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}`)

  const response = await fetch(url, { method: 'POST' })

  return response
}

export const getUserLoans = async (userId: string) => {
  const url = getUrl(`loan?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [`loan:${userId}`] } })
  const loans: LoanComplete[] = await response.json()

  return loans
}

export const revalidatUserLoans = async (userId: string) => {
  const url = getUrl(`revalidate?tag=${getTag('loan', userId)}&secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}`)

  const response = await fetch(url, { method: 'POST' })

  return response
}

export const getUserSubscriptions = async (userId: string) => {
  const url = getUrl(`subscription?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [`subscription:${userId}`] } })
  const subscriptions: Subscription[] = await response.json()

  return subscriptions
}

export const revalidateUserSubscriptions = async (userId: string) => {
  const url = getUrl(`revalidate?tag=${getTag('subscription', userId)}&secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}`)

  const response = await fetch(url, { method: 'POST' })

  return response
}
