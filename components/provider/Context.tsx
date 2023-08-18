'use client'

import { useResourceContext } from '@lib/resourceContext'
import { UserProviderComplete } from '@types'
import { Dispatch, ReactNode, SetStateAction, createContext, useContext } from 'react'

interface Props {
  children: ReactNode;
  serverValue: UserProviderComplete[];
}

export const ProviderContext = createContext<{
  providers: UserProviderComplete[];
  setProviders: Dispatch<SetStateAction<UserProviderComplete[]>>;
  addProvider: (provider: UserProviderComplete) => void;
  removeProvider: (provider: UserProviderComplete) => void;
  updateProvider: (provider: UserProviderComplete) => void;
}>({
  providers: [],
  setProviders: () => null,
  addProvider: () => null,
  removeProvider: () => null,
  updateProvider: () => null,
})

export const ProvidersProvider = ({ children, serverValue }: Props) => {
  const {
    resource: providers,
    setResource: setProviders,
    add: addProvider,
    remove: removeProvider,
    update: updateProvider
  } = useResourceContext<UserProviderComplete>(
    serverValue,
    (a, b) => a.provider.name.localeCompare(b.provider.name),
  )

  return (
    <ProviderContext.Provider value={{
      providers,
      setProviders,
      addProvider,
      removeProvider,
      updateProvider
    }}>
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