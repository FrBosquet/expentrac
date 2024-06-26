import { PERIODICITY } from './dates'
import {
  type Contract,
  type Period,
  type Provider,
  type RawPeriod
} from './prisma'

export type SubFormData = {
  id?: string
  name: string
  fee: string
  initial: string
  vendorId?: string
  platformId?: string
  startDate: string
  endDate: string
  link: string
  isYearly: boolean
  yearly: 'on' | 'off'
  payday?: string
  paymonth?: string
  periodicity?: string
} & Record<`sharedWith:${string}`, string>

const now = new Date()
const nowDate = now.getDate()
const nowMonth = now.getMonth()

const getIsPaidThisMonth = (period: Period) => {
  const { periodicity } = period

  const payday = period.payday ?? 1
  const paymonth = period.paymonth ?? 0

  if (periodicity === 'YEARLY') {
    return nowMonth > paymonth || (nowMonth === paymonth && nowDate >= payday)
  } else {
    // TODO: Compare the current month payment date with NOW
    return nowDate >= payday
  }
}

const getPeriodPaymentDate = (period: Period, date = now) => {
  const { periodicity } = period

  const payday = period.payday ?? 1
  const paymonth = period.paymonth ?? 0

  const refDate = new Date(date)

  if (periodicity === PERIODICITY.YEARLY) refDate.setMonth(paymonth)

  refDate.setDate(payday)

  return refDate
}

const getNextPaymentDate = (period: Period) => {
  const periodPaymentDate = getPeriodPaymentDate(period)

  if (now.getTime() > periodPaymentDate.getTime()) {
    const next = new Date(periodPaymentDate)

    if (period.periodicity === 'YEARLY') {
      next.setFullYear(next.getFullYear() + 1)
    } else {
      next.setMonth(next.getMonth() + 1)
    }

    return next
  } else {
    return periodPaymentDate
  }
}

export const unwrapSub = (rawSub: Contract, date = now) => {
  const { shares, periods, resources, providers } = rawSub

  const refNowDate = now.getDate()
  const refMonth = date.getMonth()

  const activePeriods = periods.filter((period) => {
    return period.to === null
  })

  if (activePeriods.length > 1) {
    throw new Error('More than one ongoing period')
  }

  const isActive = activePeriods.length === 1
  const activePeriod: RawPeriod | undefined = activePeriods[0]
  const isInactive = !isActive

  const sharesAccepted = shares.reduce(
    (acc, cur) => acc + (cur.accepted ? 1 : 0),
    0
  )
  const sharesPending = shares.reduce(
    (acc, cur) => acc + (cur.accepted === undefined ? 0 : 1),
    0
  )

  const isOngoing = activePeriods.length === 1

  // The period happening in the current reference date
  const referencePeriod: RawPeriod | undefined = periods.find((period) => {
    // date is between period from and period to
    const from = new Date(period.from)
    const to = period.to ? new Date(period.to) : null

    return to
      ? date.getTime() >= from.getTime() && date.getTime() <= to.getTime()
      : date.getTime() >= from.getTime()
  })

  const wasOngoing = referencePeriod !== undefined

  const periodicity = referencePeriod?.periodicity
  const isYearly = periodicity === 'YEARLY'

  const monthlyFee = wasOngoing ? (isYearly ? 0 : referencePeriod.fee) : 0

  const yearlyFee = wasOngoing
    ? isYearly
      ? referencePeriod.fee
      : referencePeriod.fee * 12
    : 0

  const holderAmount = sharesAccepted + 1

  const startDate: Date = periods.reduce((acc, cur) => {
    const currentFrom = new Date(cur.from)

    if (acc.getTime() > currentFrom.getTime()) {
      return currentFrom
    } else {
      return acc
    }
  }, new Date())
  const hasShares = shares.length > 0
  const hasAcceptedShares = sharesAccepted > 0

  const monthlyHolderFee = monthlyFee / holderAmount
  const yearlyHolderFee = yearlyFee / holderAmount

  const link = resources.find((r) => r.type === 'LINK')?.url

  const isPaidThisMonth = wasOngoing && getIsPaidThisMonth(referencePeriod)
  const currentMonthPaymentDate = wasOngoing
    ? getPeriodPaymentDate(referencePeriod, date)
    : null
  const currentPaymentDate = wasOngoing
    ? getPeriodPaymentDate(referencePeriod, date)
    : null
  const isPaidThisPeriod =
    currentPaymentDate && now.getTime() > currentPaymentDate.getTime()
  const nextPaymentDate = wasOngoing
    ? getNextPaymentDate(referencePeriod)
    : null

  const hasPayday =
    referencePeriod?.payday !== null && referencePeriod?.payday !== undefined

  const sameDayAsPayday = referencePeriod?.payday === refNowDate
  const sameMonthAsPayday = referencePeriod?.paymonth === refMonth

  const isPayday = isYearly
    ? sameDayAsPayday && sameMonthAsPayday
    : sameDayAsPayday

  const { vendor, platform } = providers.reduce<{
    vendor?: Provider
    platform?: Provider
  }>((acc, cur) => {
    switch (cur.as) {
      case 'VENDOR':
        return {
          ...acc,
          vendor: cur.provider
        }
      case 'PLATFORM':
        return {
          ...acc,
          platform: cur.provider
        }
      case 'LENDER':
        return {
          ...acc,
          lender: cur.provider
        }
      default:
        return acc
    }
  }, {})

  return {
    contract: rawSub,
    startDate,
    ...rawSub,
    providers: {
      vendor,
      platform
    },
    fee: {
      periodicity,
      monthly: monthlyFee,
      holder: isYearly ? yearlyHolderFee : monthlyHolderFee,
      yearly: yearlyFee,
      holderMonthly: monthlyHolderFee,
      holderYearly: yearlyHolderFee
    },
    payments: {
      isPaidThisMonth,
      isPaidThisPeriod
    },
    periods: {
      reference: referencePeriod,
      active: activePeriod,
      all: periods,
      isActive,
      isInactive
    },
    shares: {
      data: shares,
      holders: holderAmount,
      accepted: sharesAccepted,
      pending: sharesPending,
      rejected: shares.length - sharesAccepted - sharesPending,
      total: shares.length,
      hasAny: hasShares,
      isShared: hasAcceptedShares
    },
    time: {
      isOngoing,
      isYearly,
      isPayday,
      hasPayday,
      periodicity,
      payday: referencePeriod?.payday,
      paymonth: referencePeriod?.paymonth,
      currentMonthPaymentDate,
      currentPaymentDate,
      nextPaymentDate
    },
    resources: {
      link
    }
  }
}

export type Subscription = ReturnType<typeof unwrapSub>
