import { Loan } from "@prisma/client"
import { LoanExtendedInfo } from "@types"

const now = new Date()

const monthBeetween = (startDate: Date, endDate: Date) => {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
}

export const getLoanExtendedInformation = (loan: Loan, refDate: Date = now): LoanExtendedInfo => {
  const startDate = new Date(loan.startDate)
  const endDate = new Date(loan.endDate)

  const payments = monthBeetween(startDate, endDate)
  const paymentsLeft = monthBeetween(now, endDate)
  const paymentsDone = payments - paymentsLeft


  return {
    payments,
    paymentsDone,
    paymentsLeft,

    totalAmount: loan.fee * payments,
    paidAmount: loan.fee * paymentsDone,
    owedAmount: loan.fee * paymentsLeft,
  }
}