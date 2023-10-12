'use client'

import { useDate } from '@components/date/context'
import { useLoans } from '@components/loan/context'
import { useSubs } from '@components/subscription/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { getLoanExtendedInformation } from '@lib/loan'
import { type FC } from 'react'
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const now = new Date().toLocaleString('default', { month: 'short' })

const useForecastData = () => {
  const { date } = useDate()
  const { loans } = useLoans()
  const { subs } = useSubs()

  const currentDate = new Date()
  const startDate = new Date(date)
  const endDate = new Date(date)

  startDate.setMonth(startDate.getMonth() - 2)
  endDate.setMonth(endDate.getMonth() + 8)

  const subFee = subs.reduce((acc, cur) => {
    const monthlyFee = cur.yearly ? (cur.fee / 12) : cur.fee
    const holders = cur.shares.filter(share => share.accepted === true).length + 1
    const fee = monthlyFee / holders

    return acc + fee
  }, 0)

  const forecastData = new Array(12).fill(0).map((_, index) => {
    const monthDate = new Date(startDate)
    monthDate.setMonth(monthDate.getMonth() + index)

    const differentYear = monthDate.getFullYear() !== currentDate.getFullYear()

    const month = monthDate.toLocaleString('default', { month: 'short', year: differentYear ? '2-digit' : undefined })

    const loanFee = loans.reduce((acc, cur) => {
      console.log({ cur, monthDate })

      if (new Date(cur.startDate) > monthDate) return acc
      if (new Date(cur.endDate) < monthDate) return acc

      const { holderFee } = getLoanExtendedInformation(cur)

      return acc + holderFee
    }, 0)

    return {
      month,
      total: subFee + loanFee,
      loan: loanFee,
      sub: subFee
    }
  })

  return { forecastData }
}

const TooltipContent: FC = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{
    color?: string
    value: number
    name: string
  }>
  label?: string
}) => {
  if (active) {
    return (
      <div className="bg-slate-800 p-4 rounded-md shadow-md border text-slate-100">
        <p className='font-semibold text-lg'>{label}</p>
        {payload?.map((item) => (
          <p key={item.name} style={{ color: item.color }}>{item.name} {euroFormatter.format(item.value)}</p>
        ))}
      </div>
    )
  }

  return null
}

const EXPENTRAC_GREEN = '#2dff87'
const EXPENTRAC_ORANGE = '#ff5f2d'
const EXPENTRAC_CONTRAST = '#EDE2D3'

const tickStyle = {
  fill: 'var(--theme-light)',
  stroke: 'var(--theme-light)',
  fontSize: '12px',
  fontWeight: 100
}

interface Props {
  className?: string
}

export const Forecast = ({ className }: Props) => {
  const { forecastData } = useForecastData()

  return <Card className={className}>
    <CardHeader>
      <CardTitle>Forecast</CardTitle>
      <CardDescription>
        This is the forecast for your current expenses
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={forecastData}>
          <defs>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={EXPENTRAC_GREEN} stopOpacity={0.8} />
              <stop offset="90%" stopColor={EXPENTRAC_GREEN} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="loanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={EXPENTRAC_CONTRAST} stopOpacity={0.5} />
              <stop offset="90%" stopColor={EXPENTRAC_CONTRAST} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={EXPENTRAC_ORANGE} stopOpacity={0.5} />
              <stop offset="90%" stopColor={EXPENTRAC_ORANGE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" padding={{ left: 20 }} tick={tickStyle} tickLine={tickStyle} axisLine={tickStyle} />
          <YAxis tick={tickStyle} padding={{ top: 20 }} />
          <Tooltip content={TooltipContent} />
          <ReferenceLine x={now} stroke={EXPENTRAC_GREEN} label="Now" />
          <Area type="linear" dataKey="total" name="Monthly amount" stroke={EXPENTRAC_GREEN} fillOpacity={0.5} fill='url(#totalGradient)' />
          <Area type="linear" dataKey="loan" name='Loans' stroke={EXPENTRAC_CONTRAST} fill='url(#loanGradient)' />
          <Area type="linear" dataKey="sub" name='Subscriptions' stroke={EXPENTRAC_ORANGE} fill='url(#subGradient)' />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
}
