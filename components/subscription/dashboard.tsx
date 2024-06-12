'use client'

import { DateSelector } from '@components/date/selector'

import { SubscriptionAdd } from './add'
import { useSubs } from './context'
import { SubscriptionSummary } from './dashboard/summary'

// a subscription is a payment that you do every month or every year to a service that you use (like netflix, spotify, etc) or a service that you need (like a gym membership, a phone plan, etc)

export const SubsDashboard = () => {
  const { hasAnySubs } = useSubs()

  return hasAnySubs ? (
    <>
      <DateSelector />
      <SubscriptionSummary />
    </>
  ) : (
    <section className="flex flex-col items-center gap-4 p-12">
      <h1 className="text-center text-6xl font-semibold">Subscriptions</h1>
      <p className="text-center text-slate-700">
        A subscription is a payment that you do every month or every year to a
        service that you use (like netflix, spotify, etc) or a service that you
        need (like a gym membership, a phone plan, etc).
      </p>
      <p className="text-center text-slate-700">
        Track your first subscription by clicking in the button below
      </p>
      <SubscriptionAdd />
    </section>
  )
}
