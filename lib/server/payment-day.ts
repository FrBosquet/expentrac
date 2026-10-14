import { PERIODICITY } from '@lib/dates'
import { type Period } from '@lib/models'

const calendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Madrid',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

export function madridDay(date: Date) {
  const parts = calendar.formatToParts(date)
  const part = (name: string) => parts.find((p) => p.type === name)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function paymentDayMatches(
  period: Pick<Period, 'from' | 'to' | 'payday' | 'paymonth' | 'periodicity'>,
  day: string
) {
  const [year, month, date] = day.split('-').map(Number)
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const payday =
    period.payday ?? Number(madridDay(new Date(period.from)).slice(-2))
  return (
    date === Math.min(payday, lastDay) &&
    (period.periodicity !== PERIODICITY.YEARLY ||
      period.paymonth === month - 1) &&
    madridDay(new Date(period.from)) <= day &&
    (!period.to || madridDay(new Date(period.to)) >= day)
  )
}
