import { type LoanComplete, type LoanExtendedInfo } from '@types'

const now = new Date()

const monthBeetween = (startDate: Date, endDate: Date) => {
  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  const sameMonth = startDate.getMonth() === endDate.getMonth()

  if (sameYear && sameMonth) {
    return startDate.getDate() > endDate.getDate() ? 0 : 1
  }

  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
}

export const getLoanExtendedInformation = (loan: LoanComplete, refDate: Date = now): LoanExtendedInfo => {
  const { fee, initial } = loan

  const startDate = new Date(loan.startDate)
  const endDate = new Date(loan.endDate)

  const hasInitialPayment = initial > 0

  const months = monthBeetween(startDate, endDate)
  const payments = months + (hasInitialPayment ? 1 : 0)
  const paymentsLeft = monthBeetween(now, endDate)
  const paymentsDone = months - paymentsLeft

  const vendor = loan.vendor?.provider
  const platform = loan.platform?.provider
  const lender = loan.lender?.provider

  const totalAmount = fee * months + initial
  const paidAmount = paymentsDone * fee + initial
  const owedAmount = totalAmount - paidAmount

  return {
    payments,
    paymentsDone: paymentsDone + (hasInitialPayment ? 1 : 0),
    paymentsLeft,

    totalAmount,
    paidAmount,
    owedAmount,

    vendor,
    platform,
    lender
  }
}
