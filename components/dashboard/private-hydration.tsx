'use client'

import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query'
import { useQueryScope } from '@store'
import { privateHydrationState } from '@lib/query-policy'
import { useMemo, type ReactNode } from 'react'

export function PrivateHydration({
  state,
  children
}: {
  state: DehydratedState
  children: ReactNode
}) {
  const id = useQueryScope()
  const scopedState = useMemo(
    () => privateHydrationState(state, id),
    [state, id]
  )
  return <HydrationBoundary state={scopedState}>{children}</HydrationBoundary>
}
