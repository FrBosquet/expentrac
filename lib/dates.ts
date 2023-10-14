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
