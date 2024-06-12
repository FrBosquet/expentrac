/* eslint-disable prettier/prettier */
'use client'

import { useDate } from '@components/date/context'
import { ProviderLogo } from '@components/provider/ProviderLogo'
import { PaidIcon, ShareIcon } from '@components/state-icon'
import { euroFormatter } from '@lib/currency'
import { monthBeetween } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { CalendarCheck2 } from 'lucide-react'
import Link from 'next/link'

export enum COLUMN {
  FEE = 'FEE',
  AMOUNT = 'AMOUNT',
  DATES = 'DATES'
}

interface Props {
  sub: Subscription
  activeColumn: COLUMN
}

const getDateString = ({
  time: { payday, isYearly, currentPaymentDate },
  payments: { isPaidThisPeriod }
}: Subscription) => {
  const str =
    isYearly && currentPaymentDate
      ? currentPaymentDate.toLocaleDateString('default', {
        month: 'short',
        day: 'numeric'
      })
      : payday

  if (isPaidThisPeriod) {
    return `Paid on the ${str}`
  }
  return `Due on the ${str}`
}

export const SubItem = ({ sub, activeColumn }: Props) => {
  const { date } = useDate()
  const {
    id,
    name,
    startDate,
    providers: { vendor },
    payments: { isPaidThisPeriod },
    fee: { holderMonthly, holderYearly },
    shares: { hasAny, isShared },
    time: { isYearly, paymonth }
  } = sub

  const currentMonth = date.getMonth()
  const isPaymonth = isYearly ? paymonth === currentMonth : true
  const dateText = getDateString(sub)

  const monthsActive = monthBeetween(startDate, new Date())

  const fee = isYearly ? (isPaymonth ? holderYearly : 0) : holderMonthly

  return (
    <Link
      key={id}
      className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] gap-x-2 rounded-md p-1 hover:bg-theme-back lg:grid-cols-[auto_1fr_1fr_1fr_1fr]"
      href={`/dashboard/subscriptions/${id}`}
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
        {monthsActive} months active
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
        {euroFormatter.format(monthsActive * fee)}
      </p>

      <p
        className="
      hidden justify-end gap-2 text-right text-xs font-semibold text-theme-accent data-[active=true]:flex
      data-[paid=true]:text-expentrac-800
      lg:col-start-5 lg:flex lg:text-base
    "
        data-active={activeColumn === COLUMN.FEE}
        data-paid={isPaidThisPeriod}
      >
        {isYearly ? (
          <span className="mt-auto text-xs">
            (yearly
            {!isPaymonth ? ` ${euroFormatter.format(holderYearly)}` : null})
          </span>
        ) : null}
        {hasAny ? <ShareIcon shared={isShared} /> : null}
        {isPaidThisPeriod ? <PaidIcon /> : null}
        {euroFormatter.format(fee)}
      </p>
    </Link>
  )
}
