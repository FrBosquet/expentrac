'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const defaultContext = {
  date: new Date(),
  nextMonth: () => { },
  prevMonth: () => { },
  currentMonth: () => { }
}

export const DateContext = createContext<{
  date: Date
  nextMonth: () => void
  prevMonth: () => void
  currentMonth: () => void
}>(defaultContext)

const defaultDate = new Date()
defaultDate.setDate(1)

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
    setDate(new Date())
  }

  return (
    <DateContext.Provider value={{ date, nextMonth, prevMonth, currentMonth }}>
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
