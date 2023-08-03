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
import { LoanDelete } from "./LoanDelete"

type Props = {
  loans: Loan[]
}

export const LoanSummary = ({ loans }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="p-2 text-xl text-primary">Your loans:</h3>
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
                <TableCell className="font-medium">{loan.name}</TableCell>
                <TableCell>{paymentsDone}/{payments}</TableCell>
                <TableCell className="text-slate-500">{paymentsLeft}</TableCell>
                <TableCell className="font-semibold text-right">{loan.fee.toFixed(2)}€/m</TableCell>
                <TableCell>
                  <LoanDelete loan={loan} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}