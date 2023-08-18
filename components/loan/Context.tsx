'use client'

import { useResourceContext } from '@lib/resourceContext'
import { LoanComplete } from '@types'
import { Dispatch, ReactNode, SetStateAction, createContext, useContext } from 'react'

interface Props {
  children: ReactNode;
  serverValue: LoanComplete[];
}

export const LoanContext = createContext<{
  loans: LoanComplete[];
  setLoans: Dispatch<SetStateAction<LoanComplete[]>>;
  addLoan: (loan: LoanComplete) => void;
  removeLoan: (loan: LoanComplete) => void;
  updateLoan: (loan: LoanComplete) => void;
}>({
  loans: [],
  setLoans: () => null,
  addLoan: () => null,
  removeLoan: () => null,
  updateLoan: () => null,
})

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
    <LoanContext.Provider value={{ loans, setLoans, addLoan, removeLoan, updateLoan }}>
      {children}
    </LoanContext.Provider>
  )
}

export const useLoans = () => {
  const context = useContext(LoanContext)
  if (context === undefined) {
    throw new Error('useLoans must be used within a Provider')
  }
  return context
}