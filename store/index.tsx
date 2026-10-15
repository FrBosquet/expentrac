'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { PageSkeleton } from '@components/dashboard/skeletons'
import { createQueryClient } from '@lib/query-policy'
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
  const [client] = useState(createQueryClient)
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
  if (status === 'loading') return <PageSkeleton />
  const currentUserId = session?.user?.id
  if (!currentUserId) return <p>Please sign in to continue.</p>
  return (
    <SessionQueries key={currentUserId} userId={currentUserId}>
      {children}
    </SessionQueries>
  )
}
