'use client'

import { useSubs } from '@components/subscription/context'
import { PausedSubs } from '@components/subscription/dashboard/paused'
import { SubscriptionSummary } from '@components/subscription/dashboard/summary'
import { UserSubPayplan } from '@components/subscription/dashboard/user-payplan'

export default function page() {
  const { subs } = useSubs()

  return <>
    <SubscriptionSummary className='col-span-2 lg:col-span-4' />
    <UserSubPayplan subs={subs} className='col-span-2' />
    <PausedSubs className='col-span-2' />
  </>
}
