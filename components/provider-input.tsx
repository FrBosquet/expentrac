'use client'
import { QueryState } from '@components/dashboard/query-state'
import { Skeleton } from '@components/ui/skeleton'
import { useProviderCatalog } from '@hooks/resources'

import { ProviderSelect } from './ProviderSelect'
type Props = Omit<React.ComponentProps<typeof ProviderSelect>, 'items'>
export const ProviderInput = (props: Props) => {
  const query = useProviderCatalog()
  return (
    <QueryState
      pending={query.isPending}
      error={query.error}
      hasData={query.data !== undefined}
      fetching={query.isFetching}
      retry={() => {
        void query.refetch()
      }}
      skeleton={
        <div role="status" aria-label="Loading providers">
          <Skeleton className="h-10 w-full" />
          <span className="sr-only">Loading providers…</span>
        </div>
      }
    >
      <ProviderSelect
        items={query.providers.map((provider) => ({
          value: provider.id,
          label: provider.name
        }))}
        {...props}
      />
    </QueryState>
  )
}
