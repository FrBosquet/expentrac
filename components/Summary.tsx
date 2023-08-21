'use client'

import { getLoanExtendedInformation } from "@lib/loan"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@components/ui/card"
import { useLoans } from "./loan/Context"
import { useSubs } from "./subscription/context"

export const Summary = () => {
  const { loans } = useLoans()
  const { subs } = useSubs()

  const totalLoans = loans.reduce((acc, cur) => acc + cur.fee, 0)
  const totalSubs = subs.reduce((acc, cur) => acc + cur.fee, 0)
  const total = totalLoans + totalSubs

  const owedMoney = loans.reduce((acc, cur) => acc + getLoanExtendedInformation(cur).owedAmount, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your summary</CardTitle>
        <CardDescription>Right now, you owe {owedMoney}€</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto]">
          <p className="text-sm text-slate-500 dark:text-slate-400">Loans</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-right">{totalLoans.toFixed(2)}€/month</p>

          <p className="text-sm text-slate-500 dark:text-slate-400">Subscriptions</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-right">{totalSubs.toFixed(2)}€/month</p>

          <p className="text-slate-800 dark:text-slate-200">Total</p>
          <p className="text-slate-800 dark:text-slate-200 text-right">{total.toFixed(2)}€/month</p>
        </div>
      </CardContent>
    </Card>
  )
}