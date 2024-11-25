import { thisMonth } from '@lib/dates'
import { TIME } from '@types'
import { type StateCreator } from 'zustand'

const now = new Date()

export interface DateSlice {
  date: Date
  setDate: (date: Date) => void
  nextMonth: () => void
  prevMonth: () => void
}

export const createDateSlice: StateCreator<DateSlice> = (set) => ({
  date: thisMonth,
  setDate: (date: Date) => {
    set({
      date
    })
  },
  nextMonth: () => {
    set((state) => ({
      date: new Date(state.date.setMonth(state.date.getMonth() + 1))
    }))
  },
  prevMonth: () => {
    set((state) => ({
      date: new Date(state.date.setMonth(state.date.getMonth() - 1))
    }))
  }
})

export const getTime = ({ date }: DateSlice) => {
  return date < now ? TIME.PAST : date > now ? TIME.FUTURE : TIME.PRESENT
}

export const getMonthTime = ({ date }: DateSlice) => {
  const month =
    date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
      ? TIME.PRESENT
      : date > now
        ? TIME.FUTURE
        : TIME.PAST

  return month
}
