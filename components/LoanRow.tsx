import { Loan } from "@prisma/client"

type Props = {
  loan: Loan
}

export const LoanRow = ({ loan }: Props) => {
  return (
    <article className="p-2 border-b border-primary">
      {loan.name}
    </article>
  )
}