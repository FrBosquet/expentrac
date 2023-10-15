'use client'

import { TIME } from '@types'
import { createContext, useContext, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const defaultContext = {
  date: new Date(),
  nextMonth: () => { },
  prevMonth: () => { },
  currentMonth: () => { },
  time: TIME.PRESENT,
  month: TIME.PRESENT
}

export const DateContext = createContext<{
  date: Date
  nextMonth: () => void
  prevMonth: () => void
  currentMonth: () => void
  time: TIME
  month: TIME
}>(defaultContext)

const defaultDate = new Date()
defaultDate.setDate(1)

const now = new Date()

export const DateProvider = ({ children }: Props) => {
  const [date, setDate] = useState(defaultDate)

  const offsetMonth = (date: Date, offset: number) => {
    const newDate = new Date(date)
    newDate.setMonth(newDate.getMonth() + offset)
    return newDate
  }

  const nextMonth = () => {
    setDate((prev) => offsetMonth(prev, 1))
  }

  const prevMonth = () => {
    setDate((prev) => offsetMonth(prev, -1))
  }

  const currentMonth = () => {
    setDate(now)
  }

  const time = date < now
    ? TIME.PAST
    : date > now
      ? TIME.FUTURE
      : TIME.PRESENT

  const month = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    ? TIME.PRESENT
    : date > now
      ? TIME.FUTURE
      : TIME.PAST

  return (
    <DateContext.Provider value={{ date, nextMonth, prevMonth, currentMonth, time, month }}>
      {children}
    </DateContext.Provider>
  )
}

export const useDate = () => {
  const context = useContext(DateContext)
  if (context === undefined) {
    throw new Error('useDate must be used within a Provider')
  }
  return context
}
