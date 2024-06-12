'use client'

import { Button } from '@components/ui/button'
import { dateFormater } from '@lib/dates'
import { TIME } from '@types'
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  Clock,
  type LucideIcon
} from 'lucide-react'

import { useDate } from './context'

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

  return (
    <article className="flex flex-row items-center justify-between gap-2">
      <Button className="h-auto p-2" variant="ghost" onClick={prevMonth}>
        <ArrowLeft size={12} />
      </Button>
      <Button className="h-auto p-2" variant="ghost" onClick={nextMonth}>
        <ArrowRight size={12} />
      </Button>
      <Button
        className="disabled:opacity-100"
        disabled={isPresent}
        variant={isPresent ? 'ghost' : isPast ? 'default' : 'outline'}
        onClick={currentMonth}
      >
        <strong className="flex min-w-[16ch] flex-row items-center gap-2 text-xs">
          <CalendarIcon className="inline" size={12} /> {dateString}
        </strong>
      </Button>
    </article>
  )
}
