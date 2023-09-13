'use client'

import { useDate } from '@components/date/context'
import { ProviderLogo } from '@components/provider/ProviderLogo'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@components/ui/table'
import { getLoanExtendedInformation } from '@lib/loan'
import { getAccentColor } from '@lib/provider'
import { Banknote } from 'lucide-react'
import { useLoans } from './Context'
import { LoanAdd } from './add'
import { LoanDelete } from './delete'
import { LoanDetail } from './detail'
import { LoanEdit } from './edit'

export const LoanSummary = () => {
  const { date } = useDate()
  const { loans } = useLoans()

  const activeLoans = loans.filter((loan) => {
    const startDate = new Date(loan.startDate)
    const endDate = new Date(loan.endDate)

    return startDate <= date && endDate >= date
  })

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
            <TableHead>Payment day</TableHead>
            <TableHead>Pending</TableHead>
            <TableHead className="text-right">Monthly fee</TableHead>
            <TableHead className="w-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeLoans.map((loan) => {
            const { paymentsDone, payments, paymentsLeft } = getLoanExtendedInformation(loan, date)

            return (
              <TableRow key={loan.id}>
                <TableCell className="border-l-4" style={{ borderLeftColor: getAccentColor(loan.vendor?.provider) }}>
                  {loan.vendor
                    ? <ProviderLogo className="h-8" provider={loan.vendor?.provider} />
                    : <Banknote className='h-8 w-8 m-auto' />
                  }
                </TableCell>
                <TableCell className="font-medium">
                  <LoanDetail key={loan.id} loan={loan} />
                </TableCell>
                <TableCell>{paymentsDone}/{payments}</TableCell>
                <TableCell>{new Date(loan.startDate).getDate()}</TableCell>
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
