'use client'

import {
  useContracts,
  useNotificationQuery,
  useProviderRelations,
  useShareQuery
} from '@hooks/resources'
import { usePathname } from 'next/navigation'
import { QueryState } from './query-state'
import { PageSkeleton } from './skeletons'

function Contracts({
  children,
  detail,
  dashboard
}: {
  children: React.ReactNode
  detail: boolean
  dashboard: boolean
}) {
  const contracts = useContracts()
  const shares = useShareQuery()
  return (
    <QueryState
      skeleton={
        <PageSkeleton
          kind={dashboard ? 'dashboard' : detail ? 'detail' : 'list'}
        />
      }
      hasData={contracts.data !== undefined && shares.data !== undefined}
      fetching={contracts.isFetching || shares.isFetching}
      error={contracts.error ?? shares.error}
      pending={contracts.isPending || shares.isPending}
      retry={() => {
        void contracts.refetch()
        void shares.refetch()
      }}
    >
      {children}
    </QueryState>
  )
}
function Providers({ children }: { children: React.ReactNode }) {
  const query = useProviderRelations()
  const contracts = useContracts()
  const shares = useShareQuery()
  return (
    <QueryState
      skeleton={<PageSkeleton kind="list" />}
      hasData={
        query.data !== undefined &&
        contracts.data !== undefined &&
        shares.data !== undefined
      }
      fetching={query.isFetching || contracts.isFetching || shares.isFetching}
      error={query.error ?? contracts.error ?? shares.error}
      pending={query.isPending || contracts.isPending || shares.isPending}
      retry={() => {
        void query.refetch()
        void contracts.refetch()
        void shares.refetch()
      }}
    >
      {children}
    </QueryState>
  )
}
function Notifications({ children }: { children: React.ReactNode }) {
  const query = useNotificationQuery()
  return (
    <QueryState
      skeleton={<PageSkeleton kind="list" />}
      hasData={query.data !== undefined}
      fetching={query.isFetching}
      error={query.error}
      pending={query.isPending}
      retry={() => {
        void query.refetch()
      }}
    >
      {children}
    </QueryState>
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
  return (
    <Contracts
      detail={path.split('/').length > 3}
      dashboard={path === '/dashboard'}
    >
      {children}
    </Contracts>
  )
}
