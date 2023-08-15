'use client'

import { UserProviderComplete } from '@types'
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react'

interface Props {
  children: ReactNode;
  serverValue: UserProviderComplete[];
}

export const ProviderContext = createContext<{
  providers: UserProviderComplete[];
  setProviders: Dispatch<SetStateAction<UserProviderComplete[]>>;
}>({
  providers: [],
  setProviders: () => null
})

export const ProvidersProvider = ({ children, serverValue }: Props) => {
  const [providers, setProviders] = useState(serverValue)

  return (
    <ProviderContext.Provider value={{ providers, setProviders }}>
      {children}
    </ProviderContext.Provider>
  )
}

export const useProviders = () => {
  const context = useContext(ProviderContext)
  if (context === undefined) {
    throw new Error('useProviders must be used within a Provider')
  }
  return context
}