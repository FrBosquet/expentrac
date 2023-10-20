'use client'

import { useDate } from '@components/date/context'
import { useLoanShares } from '@components/loan-share/context'
import { CONTRACT_TYPE } from '@lib/contract'
import { unwrapLoan } from '@lib/loan'
import { useStore } from '@store'
import { getLoan, getLoans } from '@store/loan'

// TODO: rename this file to hooks or move to lib
export const useLoans = () => {
  const { date } = useDate()

  const loans = useStore(getLoans(date))

  const setLoans = useStore((state) => state.setLoans)
  const addLoan = useStore((state) => state.addLoan)
  const removeLoan = useStore((state) => state.removeLoan)
  const updateLoan = useStore((state) => state.updateLoan)
  const hasLoans = useStore((state) => state.loans.length > 0)

  const { shares } = useLoanShares()

  const sharedLoans = shares.filter(share => {
    return share.accepted && share.contract.type === CONTRACT_TYPE.LOAN
  }).map((loanShare) => unwrapLoan(loanShare.contract, date))

  const allLoans = [...loans, ...sharedLoans]

  const hasOwnLoans = loans.length > 0
  const hasSharedLoans = sharedLoans.length > 0
  const hasAnyLoans = hasOwnLoans || hasSharedLoans

  return {
    loans,
    setLoans,
    addLoan,
    removeLoan,
    updateLoan,
    hasLoans,
    sharedLoans,
    allLoans,
    hasOwnLoans,
    hasSharedLoans,
    hasAnyLoans
  }
}

export const useLoan = (id: string) => {
  const { date } = useDate()

  const loan = useStore(getLoan(date, id))

  return {
    loan
  }
}
