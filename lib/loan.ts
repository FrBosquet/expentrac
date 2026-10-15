import {
  centsToEuros,
  eurosToCents,
  holderAmount as sharedAmount
} from './money'
import { monthBeetween, paymentDate } from './dates'
import { type Contract, type Provider } from './models'

export type LoanFormData = {
  payday?: string
  id?: string
  name: string
  fee: string
  initial: string
  vendorId?: string
  platformId?: string
  lenderId?: string
  startDate: string
  endDate: string
  link: string
} & Record<`sharedWith:${string}`, string>

export const getPaymentPlan = (
  start: Date,
  end: Date,
  fee: number,
  initial?: number
) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const months = monthBeetween(startDate, endDate)

  const hasInitialPayment = initial && initial > 0

  const payments = months + (hasInitialPayment ? 1 : 0)

  const totalAmount = centsToEuros(
    eurosToCents(fee) * months +
      (hasInitialPayment ? eurosToCents(initial!) : 0)
  )

  return {
    endDate,
    startDate,
    months,
    hasInitialPayment,
    payments,
    totalAmount
  }
}

export const unwrapLoan = (
  rawLoan: Contract,
  refDate: Date = new Date(),
  viewerId = rawLoan.userId
) => {
  const now = new Date()
  const { shares, feeCents: baseFee, periods, resources } = rawLoan

  const initial = centsToEuros(baseFee ?? 0)

  if (periods.length === 0) throw new Error(`Loan ${rawLoan.id} has no periods`)

  const { from, to, feeCents } = periods[0]
  const fee = centsToEuros(feeCents)

  if (!to) throw new Error(`Loan ${rawLoan.id} has no end date`)

  const startDate = new Date(from)
  const endDate = new Date(to)

  const hasInitialPayment = initial && initial > 0
  const months = monthBeetween(startDate, endDate)

  const hasStarted = refDate.getTime() >= startDate.getTime()
  const hasEnded = refDate.getTime() >= endDate.getTime()
  const endsThisMonth =
    endDate.getMonth() === refDate.getMonth() &&
    endDate.getFullYear() === refDate.getFullYear()
  const startsThisMonth =
    startDate.getMonth() === refDate.getMonth() &&
    startDate.getFullYear() === refDate.getFullYear()

  const monthBeetweenRefDate = monthBeetween(refDate, endDate)
  const paymentsLeft = endsThisMonth ? 0 : monthBeetweenRefDate
  const paymentsDone = months - paymentsLeft

  const sharesAccepted = shares.reduce(
    (acc, cur) => acc + (cur.accepted ? 1 : 0),
    0
  )
  const sharesPending = shares.reduce(
    (acc, cur) => acc + (cur.accepted === undefined ? 0 : 1),
    0
  )

  const totalAmount = centsToEuros(feeCents * months + (baseFee ?? 0))
  const paidAmount = centsToEuros(paymentsDone * feeCents + (baseFee ?? 0))
  const owedAmount = totalAmount - paidAmount

  const holderAmount = 1 + sharesAccepted

  const payday = periods[0].payday ?? startDate.getUTCDate()
  const currentMonthPaymentDate = paymentDate(
    refDate.getFullYear(),
    refDate.getMonth(),
    payday
  )
  const isPaidThisMonth = now >= currentMonthPaymentDate

  const nextPaymentDate = isPaidThisMonth
    ? paymentDate(refDate.getFullYear(), refDate.getMonth() + 1, payday)
    : currentMonthPaymentDate

  const isOngoing =
    (hasStarted && !hasEnded) || startsThisMonth || endsThisMonth

  const currentFee = !isOngoing ? 0 : startsThisMonth ? initial : fee

  const holderFee = sharedAmount(eurosToCents(currentFee), rawLoan, viewerId)
  const holderMonthlyFee = sharedAmount(feeCents, rawLoan, viewerId)

  const hasShares = shares.length > 0
  const hasAcceptedShares = sharesAccepted > 0

  const link = resources.find((r) => r.type === 'LINK')?.url
  const isPayday = now.toDateString() === currentMonthPaymentDate.toDateString()

  const { vendor, platform, lender } = rawLoan.providers.reduce<{
    vendor?: Provider
    platform?: Provider
    lender?: Provider
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
    contract: rawLoan,
    viewerId,
    ...rawLoan,
    startDate,
    endDate,
    providers: {
      vendor,
      platform,
      lender
    },
    fee: {
      initial: initial || 0,
      monthly: fee,
      holder: holderFee,
      holderMonthly: holderMonthlyFee,
      holderInitial: initial
        ? sharedAmount(baseFee ?? 0, rawLoan, viewerId)
        : 0,
      current: currentFee
    },
    amount: {
      total: totalAmount,
      paid: paidAmount,
      owed: owedAmount,
      holderTotal: centsToEuros(
        Math.round(holderMonthlyFee * 100) * months +
          Math.round(sharedAmount(baseFee ?? 0, rawLoan, viewerId) * 100)
      ),
      holderPaid: centsToEuros(
        Math.round(holderMonthlyFee * 100) * paymentsDone +
          Math.round(sharedAmount(baseFee ?? 0, rawLoan, viewerId) * 100)
      ),
      holderOwed: centsToEuros(
        Math.max(
          0,
          Math.round(holderMonthlyFee * 100) * (months - paymentsDone)
        )
      )
    },
    payments: {
      total: months + (hasInitialPayment ? 1 : 0),
      done: paymentsDone + (hasInitialPayment ? 1 : 0),
      left: paymentsLeft,
      hasInitialPayment,
      isPaidThisMonth
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
      duration: months,
      isOngoing,
      isPayday,
      hasStarted,
      hasEnded,
      endsThisMonth,
      startsThisMonth,
      currentMonthPaymentDate,
      nextPaymentDate,
      payday
    },
    resources: {
      link
    }
  }
}

export type Loan = ReturnType<typeof unwrapLoan>
