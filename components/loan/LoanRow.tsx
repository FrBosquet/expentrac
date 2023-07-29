import { Loan } from "@prisma/client"
import { LoanDelete } from "./LoanDelete"

type Props = {
  loan: Loan
}

const now = new Date()

const monthBeetween = (startDate: Date, endDate: Date) => {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
}

export const LoanRow = ({ loan }: Props) => {
  const startDate = new Date(loan.startDate)
  const endDate = new Date(loan.endDate)

  const totalMonths = monthBeetween(startDate, endDate)
  const monthsLeft = monthBeetween(now, endDate)
  const alreadyPaid = totalMonths - monthsLeft

  return (
    <article className="p-2 border-b border-primary grid gap-4 grid-cols-[1fr_auto_5rem_5rem_auto]">
      <p>{loan.name}</p>
      <p className="text-gray-600 font-medium">{alreadyPaid}/{totalMonths}</p>
      <p className="text-left text-gray-500 text-sm">{monthsLeft} left</p>
      <p className="text-right font-bold">{loan.fee.toFixed(2)}€/m</p>
      <LoanDelete loan={loan} />
    </article>
  )
}