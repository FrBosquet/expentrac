'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import Link from 'next/link'

import { useLoans } from './loan/context'
import { useSubs } from './subscription/context'

export const useSummary = () => {
  const { allLoans, hasAnyLoans } = useLoans()
  const { activeSubs, hasAnySubs } = useSubs()

  const ongoingLoans = allLoans.filter((loan) => loan.time.isOngoing)

  const loanCount = ongoingLoans.length

  // TODO: Yearly may not be paid this month. Fix it
  const loanFee = ongoingLoans.reduce(
    (acc, cur) => acc + cur.fee.holderMonthly,
    0
  )

  const ongoingSubs = activeSubs.filter((sub) => sub.time.isOngoing)

  // TODO: Yearly may not be paid this month. Fix it
  const subCount = ongoingSubs.length
  const subFee = ongoingSubs.reduce((acc, cur) => {
    const { holderMonthly } = cur.fee

    return acc + holderMonthly
  }, 0)

  const totalFee = loanFee + subFee

  const owedMoney = allLoans.reduce(
    (acc, cur) => acc + cur.amount.holderTotal,
    0
  )

  const alreadyPaidLoans = ongoingLoans.filter(
    (loan) => loan.payments.isPaidThisMonth
  )
  const alreadyPaidLoansFee = alreadyPaidLoans.reduce(
    (acc, cur) => acc + cur.fee.holderMonthly,
    0
  )

  const alreadyPaidSubs = activeSubs.filter(
    (sub) => sub.payments.isPaidThisMonth
  )
  const alreadyPaidSubsFee = alreadyPaidSubs.reduce((acc, cur) => {
    return acc + cur.fee.holderMonthly
  }, 0)

  const subsWithNoPayday = activeSubs.filter((sub) => !sub.time.hasPayday)
  const subsWithNoPaydayFee = subsWithNoPayday.reduce((acc, cur) => {
    return acc + cur.fee.holder
  }, 0)

  const alreadyPaidFee = alreadyPaidLoansFee + alreadyPaidSubsFee

  const sortedContracts = [...activeSubs, ...allLoans].sort((a, b) => {
    if (!a.time.currentMonthPaymentDate) return 1
    if (!b.time.currentMonthPaymentDate) return -1

    return (
      a.time.currentMonthPaymentDate.getTime() -
      b.time.currentMonthPaymentDate.getTime()
    )
  })

  const pastContracts = sortedContracts.filter(
    (asset) => asset.payments.isPaidThisMonth
  )
  const todayContracts = sortedContracts.filter((asset) => asset.time.isPayday)
  const futureContracts = sortedContracts.filter(
    (asset) => !asset.payments.isPaidThisMonth && !asset.time.isPayday
  )

  return {
    totalFee,
    loanCount,
    loanFee,
    subCount,
    subFee,
    owedMoney,
    hasAnyLoans,
    hasAnySubs,
    alreadyPaidLoans,
    alreadyPaidLoansFee,
    alreadyPaidSubs,
    alreadyPaidSubsFee,
    alreadyPaidFee,
    subsWithNoPayday,
    subsWithNoPaydayFee,
    sortedContracts,
    pastContracts,
    todayContracts,
    futureContracts
  }
}

export const Summary = () => {
  const { loanFee, subFee, totalFee, owedMoney, hasAnyLoans, hasAnySubs } =
    useSummary()

  if (!hasAnyLoans && !hasAnySubs) {
    return (
      <section className="flex flex-col gap-4 p-12">
        <h1 className="text-center text-6xl font-semibold">Hello there!</h1>
        <p className="text-center text-slate-700">
          Looks like you are new in here. You can start by going to{' '}
          <Link className="font-semibold text-primary" href="/dashboard/loans">
            loans
          </Link>{' '}
          or{' '}
          <Link
            className="font-semibold text-primary"
            href="/dashboard/subscriptions"
          >
            subscriptions
          </Link>{' '}
          and track some of your expenses
        </p>
      </section>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your summary</CardTitle>
        <CardDescription>
          Right now, you owe {euroFormatter.format(owedMoney)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto]">
          <p className="text-sm">Loans</p>
          <p className="text-right text-sm">
            {euroFormatter.format(loanFee)}/month
          </p>

          <p className="text-sm">Subscriptions</p>
          <p className="text-right text-sm">
            {euroFormatter.format(subFee)}/month
          </p>

          <p className="text-slate-800 dark:text-slate-200">Total</p>
          <p className="text-right text-slate-800 dark:text-slate-200">
            {euroFormatter.format(totalFee)}/month
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
