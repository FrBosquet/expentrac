import { type LoanFormData } from '@lib/loan'

import { contract } from './decode'
import { arrayOf, envelope, request } from './http'

export const getUserLoans = async (userId?: string, signal?: AbortSignal) =>
  request(
    `loan?${userId ? `userId=${encodeURIComponent(userId)}` : ''}`,
    { signal },
    arrayOf(contract)
  )
export const createLoan = async (body: LoanFormData) =>
  request(
    'loan',
    { method: 'POST', body: JSON.stringify(body) },
    envelope(contract)
  )
const update = async (id: string, body: LoanFormData) =>
  request(
    `loan/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify(body) },
    envelope(contract)
  )
const deleteLoan = async (id: string) =>
  request(
    `contract/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    envelope((value) => {
      if (
        !value ||
        typeof value !== 'object' ||
        !('id' in value) ||
        typeof value.id !== 'string'
      )
        throw new Error('Invalid deletion')
      return value as { id: string }
    })
  )
export const loanSdk = {
  get: getUserLoans,
  create: createLoan,
  delete: deleteLoan,
  update
}
