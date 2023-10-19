import { type Contract } from '@sdk/contract'
import { type LoanComplete, type LoanExtendedInfo } from '@types'
import { monthBeetween } from './dates'
import { type RawProvider } from './prisma'

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

export const getPaymentPlan = (start: Date, end: Date, fee: number, initial?: number) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const months = monthBeetween(startDate, endDate)

  const hasInitialPayment = initial && initial > 0

  const payments = months + (hasInitialPayment ? 1 : 0)

  const totalAmount = Number(fee) * months + (hasInitialPayment ? Number(initial) : 0)

  return {
    endDate,
    startDate,
    months,
    hasInitialPayment,
    payments,
    totalAmount
  }
}

// TODO: Delete this function
export const getLoanExtendedInformation = (loan: LoanComplete, refDate: Date = thisMonth): LoanExtendedInfo => {
  const { fee, initial, shares } = loan

  const {
    endDate,
    months,
    hasInitialPayment,
    payments,
    totalAmount
  } = getPaymentPlan(loan.startDate, loan.endDate, fee, initial)

  const monthBeetweenRefDate = monthBeetween(refDate, endDate)
  const paymentsLeft = monthBeetweenRefDate < 0 ? 0 : monthBeetweenRefDate
  const paymentsDone = months - paymentsLeft

  const vendor = loan.vendor?.provider
  const platform = loan.platform?.provider
  const lender = loan.lender?.provider

  const paidAmount = paymentsDone * fee + initial
  const owedAmount = totalAmount - paidAmount

  const isOver = refDate > endDate
  const hasShares = shares ? shares.length > 0 : false

  const holderAmount = loan.shares.reduce((acc, cur) => acc + (cur.accepted ? 1 : 0), 0)
  const holderFee = fee / (holderAmount + 1)
  const holderTotal = totalAmount / (holderAmount + 1)

  const loanDate = new Date(loan.startDate)
  const currentMonthPaymentDate = new Date(loanDate)
  currentMonthPaymentDate.setMonth(refDate.getMonth())
  currentMonthPaymentDate.setFullYear(refDate.getFullYear())

  const nextPaymentDate = new Date(currentMonthPaymentDate)

  const isPaidThisMonth = now >= currentMonthPaymentDate

  if (isPaidThisMonth) {
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
  }

  const hasStarted = refDate.getTime() >= loanDate.getTime()
  const hasEnded = refDate.getTime() >= endDate.getTime()
  const endsThisMonth = endDate.getMonth() === refDate.getMonth() && endDate.getFullYear() === refDate.getFullYear()
  const startsThisMonth = loanDate.getMonth() === refDate.getMonth() && loanDate.getFullYear() === refDate.getFullYear()

  return {
    id: loan.id,
    loan,

    payments,
    paymentsDone: paymentsDone + (hasInitialPayment ? 1 : 0),
    paymentsLeft,

    totalAmount,
    paidAmount,
    owedAmount,

    vendor,
    platform,
    lender,

    isOver,

    hasShares,
    holderAmount,
    holderFee,
    holderTotal,

    isPaidThisMonth,
    currentMonthPaymentDate,
    nextPaymentDate,

    hasStarted,
    hasEnded,
    endsThisMonth,
    startsThisMonth
  }
}

export const unwrapLoan = (rawLoan: Contract, refDate: Date) => {
  const { shares, fee: baseFee, periods, resources } = rawLoan

  const initial = baseFee ?? 0

  if (periods.length === 0) throw new Error(`Loan ${rawLoan.id} has no periods`)

  const { from, to, fee } = periods[0]

  if (!to) throw new Error(`Loan ${rawLoan.id} has no end date`)

  const startDate = new Date(from)
  const endDate = new Date(to)

  const hasInitialPayment = initial && initial > 0
  const months = monthBeetween(startDate, endDate)

  const monthBeetweenRefDate = monthBeetween(refDate, endDate)
  const paymentsLeft = monthBeetweenRefDate < 0 ? 0 : monthBeetweenRefDate
  const paymentsDone = months - paymentsLeft

  const sharesAccepted = shares.reduce((acc, cur) => acc + (cur.accepted ? 1 : 0), 0)
  const sharesPending = shares.reduce((acc, cur) => acc + (cur.accepted === undefined ? 0 : 1), 0)

  const totalAmount = Number(fee) * months + (hasInitialPayment ? Number(initial) : 0)
  const paidAmount = paymentsDone * fee + initial
  const owedAmount = totalAmount - paidAmount

  const holderAmount = 1 + sharesAccepted

  const hasStarted = refDate.getTime() >= startDate.getTime()
  const hasEnded = refDate.getTime() >= endDate.getTime()
  const endsThisMonth = endDate.getMonth() === refDate.getMonth() && endDate.getFullYear() === refDate.getFullYear()
  const startsThisMonth = startDate.getMonth() === refDate.getMonth() && startDate.getFullYear() === refDate.getFullYear()

  const currentMonthPaymentDate = new Date(startDate)
  currentMonthPaymentDate.setMonth(refDate.getMonth())
  currentMonthPaymentDate.setFullYear(refDate.getFullYear())

  const nextPaymentDate = new Date(currentMonthPaymentDate)

  const isPaidThisMonth = now >= currentMonthPaymentDate

  const isOngoing = (hasStarted && !hasEnded) || startsThisMonth || endsThisMonth

  const currentFee = !isOngoing
    ? 0
    : startsThisMonth
      ? initial
      : fee

  const holderFee = currentFee / holderAmount

  const hasShares = shares.length > 0
  const hasAcceptedShares = sharesAccepted > 0

  const link = resources.find(r => r.type === 'LINK')?.url

  const {
    vendor,
    platform,
    lender
  } = rawLoan.providers.reduce<{
    vendor?: RawProvider
    platform?: RawProvider
    lender?: RawProvider
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
    rawLoan,
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
      hasStarted,
      hasEnded,
      endsThisMonth,
      startsThisMonth,
      currentMonthPaymentDate,
      nextPaymentDate
    },
    resources: {
      link
    }
  }
}

export type Loan = ReturnType<typeof unwrapLoan>
