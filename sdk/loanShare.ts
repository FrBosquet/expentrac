import { getUrl } from '@lib/api'
import { type LoanShareComplete } from '@types'

export const getUserLoanShares = async (userId: string) => {
  const url = getUrl(`loan-share?userId=${userId}`)

  const response = await fetch(url)

  const shares: LoanShareComplete[] = await response.json()

  return shares
}

export const updateLoanShare = async (id: string, accepted: boolean): Promise<LoanShareComplete> => {
  const url = getUrl('loan-share')

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify({ id, accepted })
  })

  const { data } = await response.json()

  return data
}

export const deleteLoanShare = async (id: string) => {
  const url = getUrl(`loan-share?id=${id}`)

  await fetch(url, { method: 'DELETE' })
}

export const loanShareSdk = {
  get: getUserLoanShares,
  update: updateLoanShare,
  delete: deleteLoanShare
}
