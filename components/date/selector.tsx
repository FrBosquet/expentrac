'use client'

import { Button } from '@components/ui/button'
import { dateFormater } from '@lib/dates'
import { ArrowLeft, ArrowRight, CalendarCheck, CalendarClock, Clock, type LucideIcon } from 'lucide-react'
import { useDate } from './context'

enum TIME {
  PAST,
  PRESENT,
  FUTURE
}

const ICONS = {
  [TIME.PAST]: CalendarCheck,
  [TIME.PRESENT]: Clock,
  [TIME.FUTURE]: CalendarClock
}

const getTime = (date: Date): TIME => {
  const now = new Date()

  if (date.getFullYear() < now.getFullYear()) {
    return TIME.PAST
  }

  if (date.getFullYear() > now.getFullYear()) {
    return TIME.FUTURE
  }

  if (date.getMonth() < now.getMonth()) {
    return TIME.PAST
  }

  if (date.getMonth() > now.getMonth()) {
    return TIME.FUTURE
  }

  return TIME.PRESENT
}

const getIcon = (time: TIME): LucideIcon => {
  return ICONS[time]
}

export const DateSelector = () => {
  const { date, nextMonth, prevMonth, currentMonth } = useDate()

  const dateString = dateFormater.format(date)

  const time = getTime(date)
  const CalendarIcon = getIcon(time)

  const isPast = time === TIME.PAST
  const isPresent = time === TIME.PRESENT

  return <article className="flex gap-2 flex-row justify-between items-center">
    <Button variant="ghost" className='p-2 h-auto' onClick={prevMonth}><ArrowLeft size={12} /></Button>
    <Button variant="ghost" className='p-2 h-auto' onClick={nextMonth}><ArrowRight size={12} /></Button>
    <Button disabled={isPresent} variant={isPresent ? 'ghost' : isPast ? 'default' : 'outline'} onClick={currentMonth} className='disabled:opacity-100'>
      <strong className='flex flex-row items-center gap-2 min-w-[16ch] text-xs'><CalendarIcon size={12} className='inline' /> {dateString}</strong>
    </Button>
  </article>
}
