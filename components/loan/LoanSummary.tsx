import { DialogTrigger } from "@components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@components/ui/table"
import { getLoanExtendedInformation } from "@lib/loan"
import { Loan } from "@prisma/client"
import { LoanAdd } from "./LoanAdd"
import { LoanDelete } from "./LoanDelete"
import { LoanDetail } from "./LoanDetail"
import { LoanEdit } from "./LoanEdit"

type Props = {
  loans: Loan[]
}

export const LoanSummary = ({ loans }: Props) => {
  return (
    <section className="flex flex-col gap-2 pt-8">
      <div className="flex justify-between">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Your loans:</h4>
        <LoanAdd />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
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
                <TableCell className="font-medium">
                  <LoanDetail key={loan.id} loan={loan} trigger={
                    <DialogTrigger asChild>
                      <button className="hover:text-primary">{loan.name}</button>
                    </DialogTrigger>
                  } />
                </TableCell>
                <TableCell>{paymentsDone}/{payments}</TableCell>
                <TableCell className="text-slate-500">{paymentsLeft}</TableCell>
                <TableCell className="font-semibold text-right">{loan.fee.toFixed(2)}€/m</TableCell>
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