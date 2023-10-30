import { TIME } from '@types'

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
