'use client'

import { ProviderLogo } from '@components/provider/ProviderLogo'
import { PaidIcon, ShareIcon } from '@components/state-icon'
import { euroFormatter } from '@lib/currency'
import { getDateText, monthBeetween } from '@lib/dates'
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

const getDateString = ({ startDate }: Subscription) => {
  const dateText = getDateText(new Date(startDate))

  return `Started ${dateText}`
}

export const SubItem = ({ sub, activeColumn }: Props) => {
  const {
    id,
    name,
    startDate,
    providers: {
      vendor
    },
    payments: {
      isPaidThisMonth
    },
    fee: {
      holder: fee
    },
    shares: {
      hasAny,
      isShared
    }
  } = sub

  const dateText = getDateString(sub)

  const monthsActive = monthBeetween(startDate, new Date())

  return <Link href={`/dashboard/subscriptions/${id}`} className='grid grid-rows-[auto_auto] grid-cols-[auto_1fr_auto] lg:grid-cols-[auto_1fr_1fr_1fr_1fr] gap-x-2' key={id}>
    <ProviderLogo className="w-8 h-8 row-span-2 self-center" provider={vendor} Default={CalendarCheck2} />
    <h3 className='lg:col-span-3 whitespace-nowrap overflow-hidden text-ellipsis'>{name}</h3>
    <p className='text-xs text-theme-light text-right uppercase lg:col-start-5' >{dateText}</p>
    <p className='text-xs self-end uppercase text-theme-light col-start-2'>{monthsActive} months active</p>

    <p data-active={activeColumn === COLUMN.DATES} className='
      hidden data-[active=true]:block lg:block col-start-3 uppercase text-center self-end text-xs
      text-foreground
      ms:text-md
      lg:text-theme-accent lg:text-xs
    '>
      {startDate.toLocaleDateString('default', { month: 'short', year: '2-digit' })}
    </p>
    <p data-active={activeColumn === COLUMN.AMOUNT} className='
      hidden uppercase text-center self-end text-theme-accent text-xs
      ms:text-sm
      data-[active=true]:block lg:block lg:text-xs
    '>{euroFormatter.format(monthsActive * fee)}</p>
    <p data-active={activeColumn === COLUMN.FEE} data-paid={isPaidThisMonth} className='
      gap-2 text-theme-accent data-[paid=true]:text-expentrac-800 font-semibold text-right justify-end hidden text-xs
      lg:text-base
      lg:col-start-5 data-[active=true]:flex lg:flex
    '>
      {hasAny ? <ShareIcon shared={isShared} /> : null}
      {isPaidThisMonth ? <PaidIcon /> : null}
      {euroFormatter.format(fee)}
    </p>
  </Link>
}
