'use client'
import { QueryState } from '@components/dashboard/query-state'
import { PageSkeleton } from '@components/dashboard/skeletons'
import { ProfileHeader } from '@components/profile/header'
import { WorkContractSummary } from '@components/work-contract/summary'
import { useProfile } from '@hooks/resources'
export default function Page() {
  const query = useProfile()
  return (
    <QueryState
      pending={query.isPending}
      error={query.error}
      hasData={query.data !== undefined}
      fetching={query.isFetching}
      retry={() => {
        void query.refetch()
      }}
      skeleton={<PageSkeleton kind="profile" />}
    >
      {query.data && <ProfileHeader user={query.data} />}
      <WorkContractSummary className="col-span-4" />
    </QueryState>
  )
}
