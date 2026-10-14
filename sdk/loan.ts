import { getTag, getUrl } from '@lib/api'
import { type LoanFormData } from '@lib/loan'
import { type Contract } from '@lib/models'

export const getUserLoans = async (userId: string) => {
  const url = getUrl(`loan?userId=${userId}`)

  const response = await fetch(url, { cache: 'no-store' })
  const loans: Contract[] = await response.json()

  return loans
}

export const createLoan = async (body: LoanFormData) => {
  const result = await fetch(getUrl('/loan'), {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const { data } = (await result.json()) as { data: Contract }
  return data
}

const update = async (id: string, body: LoanFormData) => {
  const result = await fetch(getUrl(`/loan/${id}`), {
    method: 'PATCH',
    body: JSON.stringify(body)
  })

  const { data } = (await result.json()) as { data: Contract }
  return data
}

const deleteLoan = async (id: string) => {
  const result = await fetch(getUrl(`/contract/${id}`), {
    method: 'DELETE'
  })

  const { data } = (await result.json()) as { data: Contract }
  return data
}

export const loanSdk = {
  get: getUserLoans,
  create: createLoan,
  delete: deleteLoan,
  update
}
