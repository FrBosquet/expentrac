'use client'

import { useUser } from '@components/Provider'
import { useDate } from '@components/date/context'
import { useLoanShares } from '@components/loan-share/Context'
import { ProviderLogo } from '@components/provider/ProviderLogo'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@components/ui/table'
import { euroFormatter } from '@lib/currency'
import { getLoanExtendedInformation } from '@lib/loan'
import { getAccentColor } from '@lib/provider'
import { type LoanComplete } from '@types'
import { Banknote, User } from 'lucide-react'
import { useLoans } from './Context'
import { LoanAdd } from './add'
import { LoanDelete } from './delete'
import { LoanDetail } from './detail'
import { LoanEdit } from './edit'

// TODO: We are executing twice getLOanExtendedInformation for each loan. Refactor that
const FeeContent = ({ loan }: { loan: LoanComplete }) => {
  const { shares } = loan
  const hasShares = shares.length > 0
  const anyShareAcepted = shares.some((share) => share.accepted === true)

  const { holderFee } = getLoanExtendedInformation(loan)

  return <div className="flex items-center justify-end gap-2">
    {hasShares ? <User className={!anyShareAcepted ? 'opacity-20' : ''} size={12} /> : null} {euroFormatter.format(holderFee)}/mo
  </div>
}

export const LoanSummary = () => {
  const { user } = useUser()
  const { date } = useDate()
  const { loans } = useLoans()
  const { loanShares } = useLoanShares()

  const mixedLoans = [
    ...loans,
    ...loanShares.filter((loanShare) => loanShare.accepted).map((loanShare) => loanShare.loan)
  ]

  const activeLoans = mixedLoans.filter((loan) => {
    const startDate = new Date(loan.startDate)
    const endDate = new Date(loan.endDate)

    return startDate <= date && endDate >= date
  }).sort((a, b) => {
    const aDate = new Date(a.startDate)
    const bDate = new Date(b.startDate)

    return aDate.getTime() - bDate.getTime()
  })

  if (activeLoans.length === 0) return null

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
            const userOwnsLoan = loan.user.id === user.id

            return (
              <TableRow key={loan.id}>
                <TableCell className="border-l-4" style={{ borderLeftColor: getAccentColor(loan.vendor?.provider) }}>
                  {loan.vendor
                    ? <ProviderLogo className="h-8" provider={loan.vendor?.provider} />
                    : <Banknote className='h-8 w-8 m-auto' />
                  }
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  <LoanDetail key={loan.id} loan={loan} />
                </TableCell>
                <TableCell>{paymentsDone}/{payments}</TableCell>
                <TableCell>{new Date(loan.startDate).getDate()}</TableCell>
                <TableCell className="text-slate-500">{paymentsLeft}</TableCell>
                <TableCell className="font-semibold text-right">
                  <FeeContent loan={loan} />
                </TableCell>
                <TableCell className="flex gap-1">
                  {userOwnsLoan && <>
                    <LoanEdit loan={loan} />
                    <LoanDelete loan={loan} />
                  </>}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </section>
  )
}
