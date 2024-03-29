import { TIME } from '@types'
import { type Contract, type Period } from './prisma'

export enum PERIODICITY {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export const toHTMLInputFormat = (d: Date) => {
  const date = new Date(d)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const formattedDate = `${year}-${month}-${day}`
  return formattedDate
}

// Recheck this function, we should take into account what day of the month we are in
export const monthBeetween = (startDate: Date, endDate: Date) => {
  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  const sameMonth = startDate.getMonth() === endDate.getMonth()

  const offset = startDate.getDate() > endDate.getDate() ? 0 : 1

  if (sameYear && sameMonth) {
    return offset
  }

  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
}

export const dateFormater = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })
export const fullDateFormater = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', day: 'numeric' })

export const isInXDays = (date: Date, offset: number) => {
  const xDays = new Date()
  xDays.setDate(xDays.getDate() + offset)
  return date.toDateString() === xDays.toDateString()
}

export const isYesterday = (date: Date) => isInXDays(date, -1)
export const isTomorrow = (date: Date) => isInXDays(date, 1)

export const getDateText = (date: Date) => {
  if (isYesterday(date)) return 'Yesterday'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isInXDays(date, 2)) return 'In two days'
  if (isInXDays(date, -2)) return 'Two days ago'

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export const getTimeDescription = (refDate: Date, month: TIME, type: string) => {
  switch (month) {
    case TIME.PAST: return `These where the ${type} fees you paid in ${refDate.toLocaleDateString('en-UK', { month: 'long', year: '2-digit' })}`
    case TIME.PRESENT: return `These are the ${type} fees you are paying for this month`
    case TIME.FUTURE: return `These are the fees you are going to pay in ${refDate.toLocaleDateString('en-UK', { month: 'long', year: '2-digit' })}`
  }
}

export const getOngoingPeriod = (contract: Contract, date: Date): Period | undefined => {
  const month = date.getMonth()
  const year = date.getFullYear()
  let candidate

  for (const period of contract.periods) {
    const { payday, to, from } = period
    const fromDate = new Date(from)
    const payDate = new Date(year, month, payday ?? 0)

    const fromMonth = fromDate.getMonth()
    const fromYear = fromDate.getFullYear()

    if (!to) {
      if (date >= fromDate) return period

      if (fromMonth === month && fromYear === year) {
        if (payDate >= fromDate) return period

        candidate = period
      }
    } else {
      const toDate = new Date(to)
      const toMonth = toDate.getMonth()
      const toYear = toDate.getFullYear()

      if (fromDate <= date && toDate >= date) candidate = period
      if (toMonth === month && toYear === year) {
        if (payDate <= toDate && payDate >= fromDate) return period

        candidate = period
      }
    }
  }

  return candidate
}

export const contractOnGoing = (contract: Contract, date: Date) => {
  const { periods } = contract

  return periods.some(period => {
    const from = new Date(period.from)

    if (!period.to) return from <= date

    const to = new Date(period.to)

    return from <= date && to >= date
  })
}

export const contractStarts = (contract: Contract, date: Date) => {
  const { periods } = contract

  return periods.some(period => {
    const from = new Date(period.from)

    return isInSameMont(from, date)
  })
}

export const contractEnds = (contract: Contract, date: Date) => {
  const { periods } = contract

  return periods.some(period => {
    if (!period.to) return false

    const to = new Date(period.to)

    return isInSameMont(to, date)
  })
}

export const getContractTime = (contract: Contract, date: Date) => {
  const isOngoing = contractOnGoing(contract, date)
  const startsThisMonth = contractStarts(contract, date)
  const endsThisMonth = contractEnds(contract, date)

  return {
    isOngoing,
    startsThisMonth,
    endsThisMonth
  }
}

export const contractMonthsPassed = (contract: Contract, date: Date) => {
  const { periods } = contract

  const activePeriod = periods.find(period => {
    return period.to !== undefined
  })

  if (!activePeriod) return 0

  return monthBeetween(new Date(activePeriod.from), date)
}

export const isInSameMont = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
}

export const now = new Date()

export const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
