'use client'

import { LoanComplete } from '@types'
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react'

interface Props {
  children: ReactNode;
  serverValue: LoanComplete[];
}

export const LoanContext = createContext<{
  loans: LoanComplete[];
  setLoans: Dispatch<SetStateAction<LoanComplete[]>>;
}>({
  loans: [],
  setLoans: () => null
})

export const LoansProvider = ({ children, serverValue }: Props) => {
  const [loans, setLoans] = useState(serverValue)

  return (
    <LoanContext.Provider value={{ loans, setLoans }}>
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