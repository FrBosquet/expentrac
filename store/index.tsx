'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { PageSkeleton } from '@components/dashboard/skeletons'
import {
  getSessionQueryClient,
  clearSessionQueryClient
} from '@lib/query-policy'
import { useSession, SessionProvider } from 'next-auth/react'
import { type Session } from 'next-auth'
import { createContext, useContext, useEffect } from 'react'
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
  const client = getSessionQueryClient(userId)
  return (
    <Scope.Provider value={userId}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </Scope.Provider>
  )
}

function SessionStore({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const currentUserId = session?.user?.id
  useEffect(() => {
    if (status === 'unauthenticated') clearSessionQueryClient()
  }, [status])
  if (status === 'loading') return <PageSkeleton />
  if (!currentUserId) return <p>Please sign in to continue.</p>
  return (
    <SessionQueries key={currentUserId} userId={currentUserId}>
      {children}
    </SessionQueries>
  )
}

export function StoreProvider({
  children,
  session
}: {
  children: React.ReactNode
  session: Session
}) {
  return (
    <SessionProvider session={session}>
      <SessionStore>{children}</SessionStore>
    </SessionProvider>
  )
}
