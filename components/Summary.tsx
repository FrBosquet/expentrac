import { getLoanExtendedInformation } from "@lib/loan"
import { Loan, Subscription } from "@prisma/client"

type Props = {
  loans: Loan[],
  subs: Subscription[]
}

export const Summary = ({ loans, subs }: Props) => {
  const totalLoans = loans.reduce((acc, cur) => acc + cur.fee, 0)
  const totalSubs = subs.reduce((acc, cur) => acc + cur.fee, 0)
  const total = totalLoans + totalSubs

  const owedMoney = loans.reduce((acc, cur) => acc + getLoanExtendedInformation(cur).owedAmount, 0)

  return (
    <section className="bg-primary text-white rounded-md p-4">
      <h3 className="text-xl font-bold">Your summary</h3>
      <div className="mb-4">You owe {owedMoney}€</div>

      <h4 className="font-bold text-lg">Monthly fee</h4>
      <div className="grid grid-cols-[1fr_auto] pr-12">
        <p className="text-sm">Loans</p>
        <p className="text-sm text-right">{totalLoans.toFixed(2)}€</p>

        <p className="text-sm">Subscriptions</p>
        <p className="text-sm text-right">{totalSubs.toFixed(2)}€</p>

        <p className="font-bold">Total</p>
        <p className="font-bold text-right">{total.toFixed(2)}€</p>
      </div>
    </section>
  )
}