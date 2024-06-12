'use client'

import { useDate } from '@components/date/context'
import { ProviderLogo } from '@components/provider/ProviderLogo'
import { PaidIcon, ShareIcon } from '@components/state-icon'
import { euroFormatter } from '@lib/currency'
import { getDateText } from '@lib/dates'
import { type Loan } from '@lib/loan'
import { TIME } from '@types'
import { CalendarCheck2 } from 'lucide-react'
import Link from 'next/link'

export enum COLUMN {
  FEE = 'FEE',
  AMOUNT = 'AMOUNT',
  DATES = 'DATES'
}

interface Props {
  loan: Loan
  activeColumn: COLUMN
}

const getDateString = (
  { time: { currentMonthPaymentDate, startsThisMonth, endsThisMonth } }: Loan,
  time: TIME
) => {
  const dateText = getDateText(new Date(currentMonthPaymentDate))

  if (startsThisMonth) {
    if (time === TIME.FUTURE) return `Starts ${dateText}`
    return `Started ${dateText}`
  }

  if (endsThisMonth) {
    if (time === TIME.FUTURE) return `Ends ${dateText}`
    return `Ended ${dateText}`
  }

  return dateText
}

export const LoanFee = ({ loan, activeColumn }: Props) => {
  const { time } = useDate()
  const {
    id,
    name,
    startDate,
    endDate,
    providers: { vendor },
    payments: { done: paymentsDone, total: payments, isPaidThisMonth },
    amount: { total, paid },
    fee: { holder: fee },
    shares: { hasAny, isShared }
  } = loan

  const dateText = getDateString(loan, time)

  return (
    <Link
      key={id}
      className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] gap-x-2 rounded-md p-1 hover:bg-theme-back lg:grid-cols-[auto_1fr_1fr_1fr_1fr]"
      href={`/dashboard/loans/${id}`}
    >
      <ProviderLogo
        className="row-span-2 size-8 self-center"
        Default={CalendarCheck2}
        provider={vendor}
      />
      <h3 className="truncate lg:col-span-3">{name}</h3>
      <p className="text-right text-xs uppercase text-theme-light lg:col-start-5">
        {dateText}
      </p>
      <p className="col-start-2 self-end text-xs uppercase text-theme-light">
        {paymentsDone} out of {payments}
      </p>

      <p
        className="
      ms:text-base col-start-3 hidden self-end text-center text-xs uppercase text-foreground
      data-[active=true]:block
      lg:block
      lg:text-xs lg:text-theme-accent
    "
        data-active={activeColumn === COLUMN.DATES}
      >
        {startDate.toLocaleDateString('default', {
          month: 'short',
          year: '2-digit'
        })}{' '}
        -{' '}
        {endDate.toLocaleDateString('default', {
          month: 'short',
          year: '2-digit'
        })}
      </p>
      <p
        className="
      ms:text-sm hidden self-end text-center text-xs uppercase
      text-theme-accent
      data-[active=true]:block lg:block lg:text-xs
    "
        data-active={activeColumn === COLUMN.AMOUNT}
      >
        {euroFormatter.format(paid)} / {euroFormatter.format(total)}
      </p>
      <p
        className="
      hidden justify-end gap-2 text-right text-xs font-semibold text-theme-accent data-[active=true]:flex
      data-[paid=true]:text-expentrac-800
      lg:col-start-5 lg:flex lg:text-base
    "
        data-active={activeColumn === COLUMN.FEE}
        data-paid={isPaidThisMonth}
      >
        {hasAny ? <ShareIcon shared={isShared} /> : null}
        {isPaidThisMonth ? <PaidIcon /> : null}
        {euroFormatter.format(fee)}
      </p>
    </Link>
  )
}

// TODO: Same with loan totals
