'use client'

import { useDate } from '@components/date/context'
import { CONTRACT_TYPE } from '@lib/contract'
import { unwrapLoan } from '@lib/loan'
import { useStore } from '@store'
import {
  getActiveLoans,
  getHasLoans,
  getLoan,
  getLoans
} from '@store/contracts'

// TODO: rename this file to hooks or move to lib
export const useLoans = () => {
  const { date } = useDate()

  const loans = useStore(getActiveLoans(date))
  const everyLoan = useStore(getLoans(date))

  const addLoan = useStore((state) => state.addContract)
  const removeLoan = useStore((state) => state.removeContract)
  const updateLoan = useStore((state) => state.updateContract)
  const hasLoans = useStore(getHasLoans)
  const shares = useStore((state) => state.shares)

  const sharedLoans = shares
    .filter((share) => {
      return share.accepted && share.contract.type === CONTRACT_TYPE.LOAN
    })
    .map((loanShare) => unwrapLoan(loanShare.contract, date))

  const allLoans = [...loans, ...sharedLoans].sort(
    (a, b) => a.time.payday - b.time.payday
  )

  const hasOwnLoans = loans.length > 0
  const hasSharedLoans = sharedLoans.length > 0
  const hasAnyLoans = hasOwnLoans || hasSharedLoans

  return {
    loans,
    everyLoan,
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
  const shares = useStore((state) => state.shares)

  let loan = useStore(getLoan(date, id))

  if (!loan) {
    const share = shares.find((share) => share.contract.id === id)

    if (share) {
      loan = unwrapLoan(share.contract, date)
    }
  }

  return {
    loan
  }
}
