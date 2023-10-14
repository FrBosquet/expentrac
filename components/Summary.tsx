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
import { type SubscriptionComplete } from '@types'
import Link from 'next/link'
import { useDate } from './date/context'
import { useLoans } from './loan/context'
import { useSubs } from './subscription/context'

const getSubGetMonthlyFee = (sub: SubscriptionComplete) => {
  return sub.yearly ? (sub.fee / 12) : sub.fee
}

export const getSubSharedFee = (sub: SubscriptionComplete) => {
  const monthlyFee = getSubGetMonthlyFee(sub)
  const holders = sub.shares.filter(share => share.accepted === true).length + 1
  const fee = monthlyFee / holders

  return fee
}

const getAssetTime = (date: Date) => {
  const today = new Date().getDate()
  const assetDate = date.getDate()

  return assetDate === today
    ? TIME.TODAY
    : assetDate < today
      ? TIME.PAST
      : TIME.FUTURE
}

enum TIME {
  PAST,
  TODAY,
  FUTURE
}

export const useSummary = () => {
  const { date } = useDate()
  const now = new Date()
  const today = now.getDate()

  const { allLoans, hasAnyLoans } = useLoans()
  const { allSubs, hasAnySubs } = useSubs()

  const activeLoans = allLoans.filter(loan => {
    const curStartDate = new Date(loan.startDate)
    const curEndDate = new Date(loan.endDate)

    return curStartDate <= date && curEndDate >= date
  })

  const loanCount = activeLoans.length
  const loanFee = activeLoans.reduce((acc, cur) => {
    const { holderFee } = getLoanExtendedInformation(cur)

    return acc + holderFee
  }, 0)

  const subCount = allSubs.length

  const subFee = allSubs.reduce((acc, cur) => {
    const monthlyFee = cur.yearly ? (cur.fee / 12) : cur.fee
    const holders = cur.shares.filter(share => share.accepted === true).length + 1
    const fee = monthlyFee / holders

    return acc + fee
  }, 0)

  const totalFee = loanFee + subFee

  const owedMoney = allLoans.reduce((acc, cur) => acc + getLoanExtendedInformation(cur).holderTotal, 0)

  const alreadyPaidLoans = activeLoans.filter(loan => {
    const loanDate = new Date(loan.startDate)
    const loanDay = loanDate.getDate()

    return loanDay <= today
  })

  const alreadyPaidLoansFee = alreadyPaidLoans.reduce((acc, cur) => {
    const { holderFee } = getLoanExtendedInformation(cur)

    return acc + holderFee
  }, 0)

  const alreadyPaitSubs = allSubs.filter(sub => {
    if (!sub.yearly) return false
    if (!sub.payday) return true

    const subDate = new Date(sub.payday)
    const subDay = subDate.getDate()

    return subDay <= today
  })

  const alreadyPaitSubsFee = alreadyPaitSubs.reduce((acc, cur) => {
    return acc + getSubSharedFee(cur)
  }, 0)

  const subsWithNoPayday = allSubs.filter(sub => !sub.payday)
  const subsWithNoPaydayFee = subsWithNoPayday.reduce((acc, cur) => {
    return acc + getSubSharedFee(cur)
  }, 0)

  const alreadyPaidFee = alreadyPaidLoansFee + alreadyPaitSubsFee

  const sortedSubs = allSubs.map((sub) => {
    const assetDate = new Date()

    if (sub.payday) {
      assetDate.setDate(sub.payday)
    } else {
      assetDate.setDate(1)
    }

    return {
      sub,
      date: assetDate,
      time: getAssetTime(assetDate)
    }
  })

  const sortedLoans = allLoans.map((loan) => {
    const assetDate = new Date()
    const loanStartDate = new Date(loan.startDate)
    const loanEndDate = new Date(loan.endDate)

    if (loanEndDate < assetDate) return { loan, date: loanEndDate, time: TIME.PAST }

    const day = loanStartDate.getDate()
    assetDate.setDate(day)

    return {
      loan,
      date: assetDate,
      time: getAssetTime(assetDate)
    }
  })

  const sortedAssets = [...sortedSubs, ...sortedLoans].sort((a, b) => {
    return a.date.getTime() - b.date.getTime()
  })

  const pastAssets = sortedAssets.filter(asset => asset.time === TIME.PAST)
  const todayAssets = sortedAssets.filter(asset => asset.time === TIME.TODAY)
  const futureAssets = sortedAssets.filter(asset => asset.time === TIME.FUTURE)

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
    alreadyPaitSubs,
    alreadyPaitSubsFee,
    alreadyPaidFee,
    subsWithNoPayday,
    subsWithNoPaydayFee,
    sortedAssets,
    pastAssets,
    todayAssets,
    futureAssets
  }
}

export const Summary = () => {
  const {
    loanFee,
    subFee,
    totalFee,
    owedMoney,
    hasAnyLoans,
    hasAnySubs
  } = useSummary()

  if (!hasAnyLoans && !hasAnySubs) {
    return <section className='flex flex-col gap-4 p-12'>
      <h1 className="text-6xl font-semibold text-center">Hello there!</h1>
      <p className='text-slate-700 text-center'>Looks like you are new in here. You can start by going to <Link className='text-primary font-semibold' href='/dashboard/loans'>loans</Link> or <Link className='text-primary font-semibold' href="/dashboard/subscriptions">subscriptions</Link> and track some of your expenses</p>
    </section>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your summary</CardTitle>
        <CardDescription>Right now, you owe {euroFormatter.format(owedMoney)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto]">
          <p className="text-sm">Loans</p>
          <p className="text-sm text-right">{euroFormatter.format(loanFee)}/month</p>

          <p className="text-sm">Subscriptions</p>
          <p className="text-sm text-right">{euroFormatter.format(subFee)}/month</p>

          <p className="text-slate-800 dark:text-slate-200">Total</p>
          <p className="text-slate-800 dark:text-slate-200 text-right">{euroFormatter.format(totalFee)}/month</p>
        </div>
      </CardContent>
    </Card>
  )
}
