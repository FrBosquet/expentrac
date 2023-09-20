'use client'

import { useLoanShares } from '@components/loan-share/Context'
import { useResourceContext } from '@lib/resourceContext'
import { type LoanComplete } from '@types'
import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from 'react'

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
  const context = useContext(LoanContext)
  if (context === undefined) {
    throw new Error('useLoans must be used within a Provider')
  }

  const { loanShares } = useLoanShares()

  const sharedLoans = loanShares.filter(share => share.accepted).map((loanShare) => loanShare.loan)
  const allLoans = [...context.loans, ...sharedLoans]

  const hasOwnLoans = context.loans.length > 0
  const hasSharedLoans = sharedLoans.length > 0
  const hasAnyLoans = hasOwnLoans || hasSharedLoans

  return {
    ...context,
    sharedLoans,
    allLoans,
    hasOwnLoans,
    hasSharedLoans,
    hasAnyLoans
  }
}
