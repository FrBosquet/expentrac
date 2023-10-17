'use client'

import { useDate } from '@components/date/context'
import { useLoanShares } from '@components/loan-share/context'
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

  const { loanShares } = useLoanShares()

  const sharedLoans = loanShares.filter(share => share.accepted).map((loanShare) => unwrapLoan(loanShare.loan, date))

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
