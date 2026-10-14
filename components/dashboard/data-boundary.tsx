'use client'

import {
  useContracts,
  useNotificationQuery,
  useProviderRelations,
  useShareQuery
} from '@hooks/resources'
import { usePathname } from 'next/navigation'

function State({
  pending,
  error,
  retry,
  children
}: {
  pending: boolean
  error: Error | null
  retry: () => void
  children: React.ReactNode
}) {
  if (pending) return <p role="status">Loading your data…</p>
  if (error)
    return (
      <div role="alert">
        <p>{error.message}</p>
        <button onClick={retry}>Try again</button>
      </div>
    )
  return children
}
function Contracts({ children }: { children: React.ReactNode }) {
  const contracts = useContracts()
  const shares = useShareQuery()
  return (
    <State
      error={contracts.error ?? shares.error}
      pending={contracts.isPending || shares.isPending}
      retry={() => {
        void contracts.refetch()
        void shares.refetch()
      }}
    >
      {children}
    </State>
  )
}
function Providers({ children }: { children: React.ReactNode }) {
  const query = useProviderRelations()
  return (
    <State
      error={query.error}
      pending={query.isPending}
      retry={() => {
        void query.refetch()
      }}
    >
      {children}
    </State>
  )
}
function Notifications({ children }: { children: React.ReactNode }) {
  const query = useNotificationQuery()
  return (
    <State
      error={query.error}
      pending={query.isPending}
      retry={() => {
        void query.refetch()
      }}
    >
      {children}
    </State>
  )
}
export function DashboardDataBoundary({
  children
}: {
  children: React.ReactNode
}) {
  const path = usePathname()
  if (path.startsWith('/dashboard/profile')) return children
  if (path.startsWith('/dashboard/providers'))
    return <Providers>{children}</Providers>
  if (path.startsWith('/dashboard/notifications'))
    return <Notifications>{children}</Notifications>
  return <Contracts>{children}</Contracts>
}
