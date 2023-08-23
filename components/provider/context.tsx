'use client'

import { useResourceContext } from '@lib/resourceContext'
import { type UserProviderComplete } from '@types'
import {
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from 'react'
import { useProviderExtendedInfo } from './hooks'

interface Props {
  children: ReactNode
  serverValue: UserProviderComplete[]
}

const defaultContextValue = {
  providers: [],
  setProviders: () => null,
  addProvider: () => null,
  removeProvider: () => null,
  updateProvider: () => null
}

export const ProviderContext = createContext<{
  providers: UserProviderComplete[]
  setProviders: Dispatch<SetStateAction<UserProviderComplete[]>>
  addProvider: (provider: UserProviderComplete) => void
  removeProvider: (provider: UserProviderComplete) => void
  updateProvider: (provider: UserProviderComplete) => void
}>(defaultContextValue)

export const ProvidersProvider = ({ children, serverValue }: Props) => {
  const {
    resource: providers,
    setResource: setProviders,
    add: addProvider,
    remove: removeProvider,
    update: updateProvider
  } = useResourceContext<UserProviderComplete>(serverValue, (a, b) =>
    a.provider.name.localeCompare(b.provider.name)
  )

  return (
    <ProviderContext.Provider
      value={{
        providers,
        setProviders,
        addProvider,
        removeProvider,
        updateProvider
      }}
    >
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

export const useProvidersComplete = () => {
  const { providers } = useProviders()

  const completeProviders = providers.map((provider) =>
    useProviderExtendedInfo(provider)
  )

  return { providers: completeProviders }
}
