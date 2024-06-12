'use client'

import { useSubs } from '@components/subscription/context'
import { PausedSubs } from '@components/subscription/dashboard/paused'
import { SubscriptionSummary } from '@components/subscription/dashboard/summary'
import { UserSubPayplan } from '@components/subscription/dashboard/user-payplan'

export default function Page() {
  const { subs } = useSubs()

  return (
    <>
      <SubscriptionSummary className="col-span-2 xl:col-span-4" />
      <UserSubPayplan className="col-span-2" subs={subs} />
      <PausedSubs className="col-span-2" />
    </>
  )
}
