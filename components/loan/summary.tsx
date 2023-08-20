'use client'

import { ProviderLogo } from "@components/provider/logo"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@components/ui/table"
import { getLoanExtendedInformation } from "@lib/loan"
import { getAccentColor } from "@lib/provider"
import { useLoans } from "./Context"
import { LoanAdd } from "./add"
import { LoanDelete } from "./delete"
import { LoanDetail } from "./detail"
import { LoanEdit } from "./edit"

export const LoanSummary = () => {
  const { loans } = useLoans()

  return (
    <section className="flex flex-col gap-2 pt-8">
      <div className="flex justify-between">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Your loans:</h4>
        <LoanAdd />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14" />
            <TableHead className="flex-1">Loan</TableHead>
            <TableHead>Payments</TableHead>
            <TableHead>Pending</TableHead>
            <TableHead className="text-right">Monthly fee</TableHead>
            <TableHead className="w-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => {
            const { paymentsDone, payments, paymentsLeft } = getLoanExtendedInformation(loan)

            return (
              <TableRow key={loan.id}>
                <TableCell className="border-l-4" style={{ borderLeftColor: getAccentColor(loan.vendor?.provider) }}>{
                  <ProviderLogo className="h-8" provider={loan.vendor?.provider} />
                }</TableCell>
                <TableCell className="font-medium">
                  <LoanDetail key={loan.id} loan={loan} />
                </TableCell>
                <TableCell>{paymentsDone}/{payments}</TableCell>
                <TableCell className="text-slate-500">{paymentsLeft}</TableCell>
                <TableCell className="font-semibold text-right">{loan.fee?.toFixed(2)}€/m</TableCell>
                <TableCell className="flex gap-1">
                  <LoanEdit loan={loan} />
                  <LoanDelete loan={loan} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </section>
  )
}