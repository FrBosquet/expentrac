'use client'

import { useResourceContext } from '@lib/resourceContext'
import { useStore } from '@store'
import { getShares } from '@store/share'
import { type LoanShareComplete } from '@types'
import { createContext, type Dispatch, type ReactNode, type SetStateAction } from 'react'

interface Props {
  children: ReactNode
  serverValue: LoanShareComplete[]
}

const defaultContextValue = {
  loanShares: [],
  setShares: () => null,
  addShare: () => null,
  removeShare: () => null,
  updateShare: () => null,
  hasLoanShares: false
}

export const LoanShareContext = createContext<{
  loanShares: LoanShareComplete[]
  setShares: Dispatch<SetStateAction<LoanShareComplete[]>>
  addShare: (loan: LoanShareComplete) => void
  removeShare: (loan: LoanShareComplete) => void
  updateShare: (loan: LoanShareComplete) => void
  hasLoanShares: boolean
}>(defaultContextValue)

export const LoanSharesProvider = ({ children, serverValue }: Props) => {
  const {
    resource: loanShares,
    setResource: setShares,
    add: addShare,
    remove: removeShare,
    update: updateShare
  } = useResourceContext<LoanShareComplete>(
    serverValue
  )

  return (
    <LoanShareContext.Provider value={{ loanShares, setShares, addShare, removeShare, updateShare, hasLoanShares: loanShares.length > 0 }}>
      {children}
    </LoanShareContext.Provider>
  )
}

export const useLoanShares = () => {
  const shares = useStore(getShares)

  return {
    shares
  }
}
