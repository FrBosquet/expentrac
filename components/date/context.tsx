'use client'

import { useStore } from '@store'
import { getMonthTime, getTime } from '@store/date'

const defaultDate = new Date()
defaultDate.setDate(1)

export const useDate = () => {
  const date = useStore(state => state.date)
  const nextMonth = useStore(state => state.nextMonth)
  const prevMonth = useStore(state => state.prevMonth)
  const setDate = useStore(state => state.setDate)
  const time = useStore(getTime)
  const month = useStore(getMonthTime)

  const currentMonth = () => {
    setDate(defaultDate)
  }

  return {
    date,
    nextMonth,
    prevMonth,
    currentMonth,
    setDate,
    month,
    time
  }
}
