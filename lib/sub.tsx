import { type Contract, type Period, type Provider } from './prisma'

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
  payday?: string
  paymonth?: string
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
    return nowDate >= payday
  }
}

const getPeriodPaymentDate = (period: Period) => {
  const { periodicity } = period

  const payday = period.payday ?? 1
  const paymonth = period.paymonth ?? 0

  if (periodicity === 'YEARLY') {
    return new Date(now.getFullYear(), paymonth, payday)
  } else {
    return new Date(now.getFullYear(), nowMonth, payday)
  }
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

export const unwrapSub = (rawSub: Contract) => {
  const {
    shares,
    periods,
    resources,
    providers
  } = rawSub

  const activePeriods = periods.filter(period => {
    return period.to === null
  })

  if (activePeriods.length > 1) {
    throw new Error('More than one ongoing period')
  }

  const sharesAccepted = shares.reduce((acc, cur) => acc + (cur.accepted ? 1 : 0), 0)
  const sharesPending = shares.reduce((acc, cur) => acc + (cur.accepted === undefined ? 0 : 1), 0)

  const isOngoing = activePeriods.length === 1
  const [activePeriod] = activePeriods

  const periodicity = activePeriod?.periodicity
  const isYearly = periodicity === 'YEARLY'

  const monthlyFee = isYearly ? (activePeriod.fee / 12) : activePeriod.fee
  const yearlyFee = isYearly ? activePeriod.fee : (activePeriod.fee * 12)

  const holderAmount = sharesAccepted + 1

  const startDate = new Date(activePeriod.from)

  const hasShares = shares.length > 0
  const hasAcceptedShares = sharesAccepted > 0

  const monthlyHolderFee = monthlyFee / holderAmount
  const yearlyHolderFee = yearlyFee / holderAmount

  const link = resources.find(r => r.type === 'LINK')?.url

  const isPaidThisMonth = getIsPaidThisMonth(activePeriod)
  const currentMonthPaymentDate = getPeriodPaymentDate(activePeriod)
  const nextPaymentDate = getNextPaymentDate(activePeriod)

  const hasPayday = activePeriod?.payday !== null && activePeriod?.payday !== undefined

  const sameDayAsPayday = activePeriod?.payday === nowDate
  const sameMonthAsPayday = activePeriod?.paymonth === nowMonth
  const isPayday = isYearly
    ? sameDayAsPayday && sameMonthAsPayday
    : sameDayAsPayday

  const {
    vendor,
    platform
  } = providers.reduce<{
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
      isPaidThisMonth
    },
    periods: {
      active: activePeriod,
      all: periods
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
      payday: activePeriod?.payday,
      paymonth: activePeriod?.paymonth,
      currentMonthPaymentDate,
      nextPaymentDate
    },
    resources: {
      link
    }
  }
}

export type Subscription = ReturnType<typeof unwrapSub>
