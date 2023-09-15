import { getUrl } from '@lib/api'
import { type LoanShareComplete } from '@types'

export const getUserLoanShares = async (userId: string) => {
  const url = getUrl(`loan-share?userId=${userId}`)

  const response = await fetch(url)

  const shares: LoanShareComplete[] = await response.json()

  return shares
}

export const deleteLoanShare = async (id: string) => {
  const url = getUrl(`loan-share?id=${id}`)

  await fetch(url, { method: 'DELETE' })
}
