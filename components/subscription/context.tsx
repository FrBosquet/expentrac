'use client'

import { useResourceContext } from '@lib/resourceContext'
import { SubscriptionComplete } from '@types'
import { Dispatch, ReactNode, SetStateAction, createContext, useContext } from 'react'

interface Props {
  children: ReactNode;
  serverValue: SubscriptionComplete[];
}

export const SubContext = createContext<{
  subs: SubscriptionComplete[];
  setSubs: Dispatch<SetStateAction<SubscriptionComplete[]>>;
  addSub: (sub: SubscriptionComplete) => void;
  removeSub: (sub: SubscriptionComplete) => void;
  updateSub: (sub: SubscriptionComplete) => void;
}>({
  subs: [],
  setSubs: () => null,
  addSub: () => null,
  removeSub: () => null,
  updateSub: () => null,
})

export const SubsProvider = ({ children, serverValue }: Props) => {
  const {
    resource: subs,
    setResource: setSubs,
    add: addSub,
    remove: removeSub,
    update: updateSub
  } = useResourceContext<SubscriptionComplete>(
    serverValue,
    (a, b) => a.name.localeCompare(b.name)
  )

  return (
    <SubContext.Provider value={{ subs, setSubs, addSub, removeSub, updateSub }}>
      {children}
    </SubContext.Provider>
  )
}

export const useSubs = () => {
  const context = useContext(SubContext)
  if (context === undefined) {
    throw new Error('useSubs must be used within a Provider')
  }
  return context
}