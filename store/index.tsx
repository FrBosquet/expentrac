'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useState } from 'react'
import { create } from 'zustand'

import { createDateSlice, type DateSlice } from './date'

export const useStore = create<DateSlice>((...args) => createDateSlice(...args))
const Scope = createContext('')
export const useQueryScope = () => useContext(Scope)

function SessionQueries({
  children,
  userId
}: {
  children: React.ReactNode
  userId: string
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: (count, error) =>
              count < 2 && (!('status' in error) || Number(error.status) >= 500)
          },
          mutations: { retry: false }
        }
      })
  )
  useEffect(
    () => () => {
      void client.cancelQueries()
      client.clear()
    },
    [client]
  )
  return (
    <Scope.Provider value={userId}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </Scope.Provider>
  )
}

export function StoreProvider({
  children,
  userId
}: {
  children: React.ReactNode
  userId: string
}) {
  const { data: session, status } = useSession()
  if (status === 'loading') return <p role="status">Loading your session…</p>
  const currentUserId = session?.user?.id
  if (!currentUserId) return <p>Please sign in to continue.</p>
  return (
    <SessionQueries key={currentUserId} userId={currentUserId}>
      {children}
    </SessionQueries>
  )
}
