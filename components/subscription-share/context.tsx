'use client'

import { useResourceContext } from '@lib/resourceContext'
import { type SubscriptionShareComplete } from '@types'
import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from 'react'

interface Props {
  children: ReactNode
  serverValue: SubscriptionShareComplete[]
}

const defaultContextValue = {
  subShares: [],
  setShares: () => null,
  addShare: () => null,
  removeShare: () => null,
  updateShare: () => null,
  hasSubShares: false
}

export const SubShareContext = createContext<{
  subShares: SubscriptionShareComplete[]
  setShares: Dispatch<SetStateAction<SubscriptionShareComplete[]>>
  addShare: (sub: SubscriptionShareComplete) => void
  removeShare: (sub: SubscriptionShareComplete) => void
  updateShare: (sub: SubscriptionShareComplete) => void
  hasSubShares: boolean
}>(defaultContextValue)

export const SubscriptionSharesProvider = ({ children, serverValue }: Props) => {
  const {
    resource: subShares,
    setResource: setShares,
    add: addShare,
    remove: removeShare,
    update: updateShare
  } = useResourceContext<SubscriptionShareComplete>(
    serverValue
  )

  return (
    <SubShareContext.Provider value={{ subShares, setShares, addShare, removeShare, updateShare, hasSubShares: subShares.length > 0 }}>
      {children}
    </SubShareContext.Provider>
  )
}

export const useSubShares = () => {
  const context = useContext(SubShareContext)
  if (context === undefined) {
    throw new Error('useSubShares must be used within a Provider')
  }

  return context
}
