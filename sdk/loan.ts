import { getTag, getUrl } from '@lib/api'
import { type LoanFormData } from '@lib/loan'
import { type Contract } from './contract'

export const getUserLoans = async (userId: string) => {
  const url = getUrl(`loan?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [`loan:${userId}`] } })
  const loans: Contract[] = await response.json()

  return loans
}

export const revalidateUserLoans = async (userId: string) => {
  const url = getUrl(`revalidate?tag=${getTag('loan', userId)}&secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}`)

  const response = await fetch(url, { method: 'POST' })
  return response
}

export const createLoan = async (body: LoanFormData) => {
  const result = await fetch(getUrl('/loan'), {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const { data } = await result.json() as { data: Contract }
  return data
}

export const updateLoan = async (body: LoanFormData) => {
  const result = await fetch(getUrl('/loan'), {
    method: 'PATCH',
    body: JSON.stringify(body)
  })

  const { data } = await result.json() as { data: Contract }
  return data
}

export const removeLoan = async (id: string) => {
  const result = await fetch(getUrl(`/loan/${id}`), {
    method: 'DELETE'
  })

  const { data } = await result.json() as { data: Contract }
  return data
}

export const loanSdk = {
  get: getUserLoans,
  create: createLoan,
  revalidate: revalidateUserLoans,
  delete: removeLoan,
  update: updateLoan
}
