'use client'

import { useUser } from '@components/Provider'
import { useDate } from '@components/date/context'
import { useLoanShares } from '@components/loan-share/context'
import { ProviderLogo } from '@components/provider/ProviderLogo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
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
import { TIME, type LoanComplete, type LoanExtendedInfo } from '@types'
import { CalendarCheck2, User } from 'lucide-react'
import { LoanAdd } from './add'
import { useLoans } from './context'
import { LoanDelete } from './delete'
import { LoanDetail } from './detail'
import { LoanEdit } from './edit'
import { LoanItem } from './item'

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

export const LoanSummaryLegacy = () => {
  const { user, ownsAsset } = useUser()
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

  if (activeLoans.length === 0 || !user) return null

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Loans</CardTitle>
        <LoanAdd />
      </CardHeader>
      <CardContent>
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
              const userOwnsLoan = ownsAsset(loan)

              return (
                <TableRow key={loan.id}>
                  <TableCell className="border-l-4" style={{ borderLeftColor: getAccentColor(loan.vendor?.provider) }}>
                    <ProviderLogo className="h-8 w-8 m-auto" provider={loan.vendor?.provider} Default={CalendarCheck2} />
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
      </CardContent>
    </Card>
  )
}
interface Props {
  className?: string
}

const getDescription = (refDate: Date, month: TIME) => {
  switch (month) {
    case TIME.PAST: return `These where your active loans in ${refDate.toLocaleDateString('en-UK', { month: 'long', year: '2-digit' })}`
    case TIME.PRESENT: return 'These are your active loans for this month'
    case TIME.FUTURE: return `These are your active loans for ${refDate.toLocaleDateString('en-UK', { month: 'long', year: '2-digit' })}`
  }
}

export const LoanSummary = ({ className }: Props) => {
  const { date, month } = useDate()
  const { loans } = useLoans()

  const extendedLoans = loans.reduce<LoanExtendedInfo[]>((acc, loan) => {
    const extendedInfo = getLoanExtendedInformation(loan, date)

    const { endsThisMonth, hasEnded, hasStarted, startsThisMonth } = extendedInfo
    if (hasEnded && !endsThisMonth) return acc
    if (!hasStarted && !startsThisMonth) return acc

    return [...acc, extendedInfo]
  }, [])

  const hasAssets = extendedLoans.length > 0

  return <Card className={className}>
    <CardHeader>
      <CardTitle>Your loan summary</CardTitle>
      <CardDescription>
        {getDescription(date, month)}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {hasAssets
        ? <div className='flex flex-col gap-3'>
          {extendedLoans.map((info) => <LoanItem extendedInfo={info} withDate key={info.id} />)}
        </div>
        : <div className='grid place-content-center gap-2 p-6 text-center'>
          <p className='text-sm text-theme-light'>You have no subscriptions to pay today</p>
        </div>
      }
    </CardContent>
  </Card>
}
