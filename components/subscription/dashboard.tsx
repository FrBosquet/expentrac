'use client'

import { DateSelector } from '@components/date/selector'
import { SubscriptionAdd } from './add'
import { useSubs } from './context'
import { SubscriptionSummary } from './dashboard/summary'

// a subscription is a payment that you do every month or every year to a service that you use (like netflix, spotify, etc) or a service that you need (like a gym membership, a phone plan, etc)

export const SubsDashboard = () => {
  const { hasAnySubs } = useSubs()

  return hasAnySubs
    ? <>
      <DateSelector />
      <SubscriptionSummary />
    </>
    : <section className='flex flex-col gap-4 p-12 items-center'>
      <h1 className="text-6xl font-semibold text-center">Subscriptions</h1>
      <p className='text-slate-700 text-center'>A subscription is a payment that you do every month or every year to a service that you use (like netflix, spotify, etc) or a service that you need (like a gym membership, a phone plan, etc).</p>
      <p className='text-slate-700 text-center'>Track your first subscription by clicking in the button below</p>
      <SubscriptionAdd />
    </section>
}
