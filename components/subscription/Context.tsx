'use client'

import { Subscription } from '@prisma/client'
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react'

interface Props {
  children: ReactNode;
  serverValue: Subscription[];
}

export const SubContext = createContext<{
  subs: Subscription[];
  setSubs: Dispatch<SetStateAction<Subscription[]>>;
}>({
  subs: [],
  setSubs: () => null
})

export const SubsProvider = ({ children, serverValue }: Props) => {
  const [subs, setSubs] = useState(serverValue)

  return (
    <SubContext.Provider value={{ subs, setSubs }}>
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