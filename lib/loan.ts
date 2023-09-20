import { type LoanComplete, type LoanExtendedInfo } from '@types'
import { monthBeetween } from './dates'

const now = new Date()

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

export const getLoanExtendedInformation = (loan: LoanComplete, refDate: Date = now): LoanExtendedInfo => {
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

  return {
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
    holderFee
  }
}
