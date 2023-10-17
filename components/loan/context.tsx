'use client'

import { useDate } from '@components/date/context'
import { useLoanShares } from '@components/loan-share/context'
import { unwrapLoan } from '@lib/loan'
import { useResourceContext } from '@lib/resourceContext'
import { useStore } from '@store'
import { getLoan, getLoans } from '@store/loan'
import { type LoanComplete } from '@types'
import { createContext, type Dispatch, type ReactNode, type SetStateAction } from 'react'

interface Props {
  children: ReactNode
  serverValue: LoanComplete[]
}

const defaultContextValue = {
  loans: [],
  setLoans: () => null,
  addLoan: () => null,
  removeLoan: () => null,
  updateLoan: () => null,
  hasLoans: false
}

export const LoanContext = createContext<{
  loans: LoanComplete[]
  setLoans: Dispatch<SetStateAction<LoanComplete[]>>
  addLoan: (loan: LoanComplete) => void
  removeLoan: (loan: LoanComplete) => void
  updateLoan: (loan: LoanComplete) => void
  hasLoans: boolean
}>(defaultContextValue)

export const LoansProvider = ({ children, serverValue }: Props) => {
  const {
    resource: loans,
    setResource: setLoans,
    add: addLoan,
    remove: removeLoan,
    update: updateLoan
  } = useResourceContext<LoanComplete>(
    serverValue,
    (a, b) => {
      if (a.startDate === b.startDate) return a.name.localeCompare(b.name)
      return a.startDate > b.startDate ? -1 : 1
    }
  )

  return (
    <LoanContext.Provider value={{ loans, setLoans, addLoan, removeLoan, updateLoan, hasLoans: loans.length > 0 }}>
      {children}
    </LoanContext.Provider>
  )
}

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
