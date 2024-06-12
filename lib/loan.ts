import { monthBeetween } from './dates'
import { type Contract, type Provider } from './prisma'

export type LoanFormData = {
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

const now = new Date()
const thisMonth = new Date()
thisMonth.setDate(1)

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

  const totalAmount =
    Number(fee) * months + (hasInitialPayment ? Number(initial) : 0)

  return {
    endDate,
    startDate,
    months,
    hasInitialPayment,
    payments,
    totalAmount
  }
}

export const unwrapLoan = (rawLoan: Contract, refDate: Date = new Date()) => {
  const { shares, fee: baseFee, periods, resources } = rawLoan

  const initial = baseFee ?? 0

  if (periods.length === 0) throw new Error(`Loan ${rawLoan.id} has no periods`)

  const { from, to, fee } = periods[0]

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

  const totalAmount =
    Number(fee) * months + (hasInitialPayment ? Number(initial) : 0)
  const paidAmount = paymentsDone * fee + initial
  const owedAmount = totalAmount - paidAmount

  const holderAmount = 1 + sharesAccepted

  const currentMonthPaymentDate = new Date(startDate)
  currentMonthPaymentDate.setMonth(refDate.getMonth())
  currentMonthPaymentDate.setFullYear(refDate.getFullYear())

  const nextPaymentDate = new Date(currentMonthPaymentDate)
  const isPaidThisMonth = now >= currentMonthPaymentDate

  if (isPaidThisMonth) nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

  const isOngoing =
    (hasStarted && !hasEnded) || startsThisMonth || endsThisMonth

  const currentFee = !isOngoing ? 0 : startsThisMonth ? initial : fee

  const holderFee = currentFee / holderAmount
  const holderMonthlyFee = fee / holderAmount

  const hasShares = shares.length > 0
  const hasAcceptedShares = sharesAccepted > 0

  const link = resources.find((r) => r.type === 'LINK')?.url
  const payday = startDate.getDate()
  const isPayday = now.getDate() === payday

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
      holderInitial: initial ? initial / holderAmount : 0,
      current: currentFee
    },
    amount: {
      total: totalAmount,
      paid: paidAmount,
      owed: owedAmount,
      holderTotal: totalAmount / holderAmount,
      holderPaid: paidAmount / holderAmount,
      holderOwed: owedAmount / holderAmount
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
