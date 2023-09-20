import { getTag, getUrl } from '@lib/api'
import { type LoanComplete } from '@types'

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

export const updateLoan = async (body: Record<string, unknown>) => {
  const result = await fetch(getUrl('/loan'), {
    method: 'PATCH',
    body: JSON.stringify(body)
  })

  const { data } = await result.json() as { data: LoanComplete }

  return data
}

export const loanSdk = {
  getUserLoans,
  revalidatUserLoans,
  updateLoan
}
