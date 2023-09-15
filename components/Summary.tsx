'use client'

import { getLoanExtendedInformation } from '@lib/loan'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import Link from 'next/link'
import { useDate } from './date/context'
import { DateSelector } from './date/selector'
import { useLoans } from './loan/Context'
import { useSubs } from './subscription/context'

export const Summary = () => {
  const { date } = useDate()

  const { loans } = useLoans()
  const { subs } = useSubs()

  const totalLoans = loans.reduce((acc, cur) => {
    const curStartDate = new Date(cur.startDate)
    const curEndDate = new Date(cur.endDate)

    if (curStartDate > date) return acc
    if (curEndDate < date) return acc

    return acc + cur.fee
  }, 0)

  const totalSubs = subs.reduce((acc, cur) => acc + (cur.yearly ? (cur.fee / 12) : cur.fee), 0)
  const total = totalLoans + totalSubs

  const owedMoney = loans.reduce((acc, cur) => acc + getLoanExtendedInformation(cur).owedAmount, 0)

  if (loans.length === 0 && subs.length === 0) {
    return <section className='flex flex-col gap-4 p-12'>
      <h1 className="text-6xl font-semibold text-center">Hello there!</h1>
      <p className='text-slate-700 text-center'>Looks like you are new in here. You can start by going to <Link className='text-primary font-semibold' href='/dashboard/loans'>loans</Link> or <Link className='text-primary font-semibold' href="/dashboard/subscriptions">subscriptions</Link> and track some of your expenses</p>
    </section>
  }

  return (
    <>
      <DateSelector />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your summary</CardTitle>
          <CardDescription>Right now, you owe {euroFormatter.format(owedMoney)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_auto]">
            <p className="text-sm text-slate-500 dark:text-slate-400">Loans</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-right">{euroFormatter.format(totalLoans)}/month</p>

            <p className="text-sm text-slate-500 dark:text-slate-400">Subscriptions</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-right">{euroFormatter.format(totalSubs)}/month</p>

            <p className="text-slate-800 dark:text-slate-200">Total</p>
            <p className="text-slate-800 dark:text-slate-200 text-right">{euroFormatter.format(total)}/month</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
