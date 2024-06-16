import { ProfileHeader } from '@components/profile/header'
import { WorkContractSummary } from '@components/work-contract/summary'

import { getUserData } from './getUser'

export default async function Page() {
  const user = await getUserData()

  return (
    <>
      <ProfileHeader user={user} />
      <WorkContractSummary className="col-span-4" />
    </>
  )
}
