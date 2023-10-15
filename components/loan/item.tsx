'use client'

import { useDate } from '@components/date/context'
import { ProviderLogo } from '@components/provider/ProviderLogo'
import { euroFormatter } from '@lib/currency'
import { getDateText } from '@lib/dates'
import { TIME, type LoanExtendedInfo } from '@types'
import { CalendarCheck2 } from 'lucide-react'

interface Props {
  extendedInfo: LoanExtendedInfo
  past?: boolean
  withDate?: boolean
}

const getDateString = ({ currentMonthPaymentDate, startsThisMonth, endsThisMonth }: LoanExtendedInfo, time: TIME) => {
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

export const LoanItem = ({ extendedInfo, past, withDate }: Props) => {
  const { time } = useDate()
  const {
    loan, payments,
    paymentsDone,
    isPaidThisMonth
  } = extendedInfo
  const { name, vendor, id, fee } = loan

  const dateText = getDateString(extendedInfo, time)

  return <article className='grid grid-rows-[auto_auto] grid-cols-[auto_1fr_auto] gap-x-2' key={id}>
    <ProviderLogo className="w-8 h-8 row-span-2 self-center" provider={vendor?.provider} Default={CalendarCheck2} />
    <h3 data-withdate={withDate} className='col-span-2 data-[withdate=true]:col-span-1 whitespace-nowrap overflow-hidden text-ellipsis'>{name}</h3>
    <p className='text-xs text-theme-light text-right uppercase' >{dateText}</p>
    <p className='text-xs self-end uppercase text-theme-light'>{paymentsDone} out of {payments}</p>
    <p data-paid={isPaidThisMonth} className='text-theme-accent data-[paid=true]:text-expentrac-800 font-semibold text-right'>{euroFormatter.format(fee)}</p>
  </article>
}
