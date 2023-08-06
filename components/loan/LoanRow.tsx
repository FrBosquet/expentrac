import { getLoanExtendedInformation } from "@lib/loan"
import { Loan } from "@prisma/client"
import { LoanDelete } from "./LoanDelete"
import { LoanEdit } from "./LoanEdit"

type Props = {
  loan: Loan
}

export const LoanRow = ({ loan }: Props) => {
  const { paymentsDone, payments, paymentsLeft } = getLoanExtendedInformation(loan)

  return (
    <article className="p-2 border-b border-primary grid gap-4 grid-cols-[1fr_auto_5rem_5rem_auto_auto]">
      <p>{loan.name}</p>
      <p className="text-gray-600 font-medium">{paymentsDone}/{payments}</p>
      <p className="text-left text-gray-500 text-sm">{paymentsLeft} left</p>
      <p className="text-right font-bold">{loan.fee.toFixed(2)}€/m</p>
      <LoanEdit loan={loan} />
      <LoanDelete loan={loan} />
    </article>
  )
}