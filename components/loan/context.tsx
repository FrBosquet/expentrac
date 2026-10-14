'use client'

import { useDate } from '@components/date/context'
import { useContracts, useShareQuery } from '@hooks/resources'
import { useQueryScope } from '@store'
import { CONTRACT_TYPE } from '@lib/contract'
import { unwrapLoan } from '@lib/loan'

export const useLoans = () => {
  const viewerId = useQueryScope()
  const { date } = useDate()
  const query = useContracts()
  const sharesQuery = useShareQuery()
  const everyLoan = query.contracts
    .filter((contract) => contract.type === CONTRACT_TYPE.LOAN)
    .map((contract) => unwrapLoan(contract, date, viewerId))
  const loans = everyLoan.filter((loan) => loan.time.isOngoing)
  const sharedLoans = sharesQuery.shares
    .filter(
      (share) =>
        share.accepted === true && share.contract?.type === CONTRACT_TYPE.LOAN
    )
    .map((share) => unwrapLoan(share.contract!, date, viewerId))
  const allLoans = [...loans, ...sharedLoans].sort(
    (a, b) => a.time.payday - b.time.payday
  )
  return {
    loans,
    everyLoan,
    sharedLoans,
    allLoans,
    hasLoans: everyLoan.length > 0,
    hasOwnLoans: loans.length > 0,
    hasSharedLoans: sharedLoans.length > 0,
    hasAnyLoans: allLoans.length > 0,
    isLoading: query.isPending || sharesQuery.isPending,
    error: query.error ?? sharesQuery.error
  }
}
export const useLoan = (id: string) => {
  const viewerId = useQueryScope()
  const { date } = useDate()
  const query = useContracts()
  const shares = useShareQuery()
  const contract =
    query.contracts.find((c) => c.id === id && c.type === CONTRACT_TYPE.LOAN) ??
    shares.shares.find((s) => s.accepted === true && s.contractId === id)
      ?.contract
  return {
    loan: contract ? unwrapLoan(contract, date, viewerId) : null,
    isLoading: query.isPending || shares.isPending,
    error: query.error ?? shares.error
  }
}
