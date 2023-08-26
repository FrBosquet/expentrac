import { type LoanComplete, type LoanExtendedInfo } from '@types'

const now = new Date()

const monthBeetween = (startDate: Date, endDate: Date) => {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
}

export const getLoanExtendedInformation = (loan: LoanComplete, refDate: Date = now): LoanExtendedInfo => {
  const { fee, initial } = loan

  const startDate = new Date(loan.startDate)
  const endDate = new Date(loan.endDate)

  const payments = monthBeetween(startDate, endDate)
  const paymentsLeft = monthBeetween(now, endDate)
  const paymentsDone = payments - paymentsLeft

  const vendor = loan.vendor?.provider
  const platform = loan.platform?.provider
  const lender = loan.lender?.provider

  const totalAmount = fee * payments + initial
  const paidAmount = paymentsDone * fee + initial
  const owedAmount = totalAmount - paidAmount

  return {
    payments,
    paymentsDone,
    paymentsLeft,

    totalAmount,
    paidAmount,
    owedAmount,

    vendor,
    platform,
    lender
  }
}
