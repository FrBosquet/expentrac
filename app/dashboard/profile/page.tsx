'use client'
import { ProfileHeader } from '@components/profile/header'
import { WorkContractSummary } from '@components/work-contract/summary'
import { useProfile } from '@hooks/resources'
export default function Page() {
  const query = useProfile()
  if (query.isPending) return <p role="status">Loading profile…</p>
  if (query.isError) return <p role="alert">{query.error.message}</p>
  return (
    <>
      <ProfileHeader user={query.data} />
      <WorkContractSummary className="col-span-4" />
    </>
  )
}
