'use client'

import { useSubs } from '@components/subscription/context'
import { SubscriptionSummary } from '@components/subscription/dashboard/summary'
import { UserSubPayplan } from '@components/subscription/dashboard/user-payplan'

export default function page() {
  // TODO: This should be everysub, as we should be able to pause and have paused subs
  const { subs } = useSubs()

  return <>
    <SubscriptionSummary className='col-span-2 lg:col-span-4' />
    <UserSubPayplan subs={subs} className='col-span-2 lg:col-span-4' />
  </>
}
