'use client'

import { useDate } from '@components/date/context'
import { useLoans } from '@components/loan/context'
import { usePayplan } from '@components/payplan/use-payplan'
import { useSubs } from '@components/subscription/context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { type FC } from 'react'
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const now = new Date().toLocaleString('default', { month: 'short' })

const useForecastData = () => {
  const { date } = useDate()
  const currentDate = new Date()
  const startDate = new Date(date)
  const endDate = new Date(date)

  startDate.setMonth(startDate.getMonth() - 2)
  endDate.setMonth(endDate.getMonth() + 8)

  const { loans } = useLoans()
  const { subs } = useSubs()
  const payplan = usePayplan(startDate, { loans, subs })

  startDate.setMonth(startDate.getMonth() - 2)
  endDate.setMonth(endDate.getMonth() + 8)

  const forecastData = payplan.map((monthData) => {
    const {
      date,
      monthlyHolderFee,
      monthlyLoanHolderFee,
      monthlySubHolderFee,
      holderOwed
    } = monthData

    const differentYear = date.getFullYear() !== currentDate.getFullYear()
    const month = date.toLocaleString('default', {
      month: 'short',
      year: differentYear ? '2-digit' : undefined
    })

    return {
      month,
      total: monthlyHolderFee,
      loan: monthlyLoanHolderFee,
      sub: monthlySubHolderFee,
      owed: holderOwed
    }
  })

  return { forecastData }
}

const TooltipContent: FC = ({
  active,
  payload,
  label
}: {
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
      <div className="rounded-md border bg-slate-800 p-4 text-slate-100 shadow-md">
        <p className="text-lg font-semibold">{label}</p>
        {payload?.map((item) => (
          <p key={item.name} style={{ color: item.color }}>
            {item.name} {euroFormatter.format(item.value)}
          </p>
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Forecast</CardTitle>
        <CardDescription>
          This is the forecast for your current expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer height={300} width="100%">
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="totalGradient" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={EXPENTRAC_GREEN}
                  stopOpacity={0.8}
                />
                <stop
                  offset="90%"
                  stopColor={EXPENTRAC_GREEN}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="loanGradient" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={EXPENTRAC_CONTRAST}
                  stopOpacity={0.5}
                />
                <stop
                  offset="90%"
                  stopColor={EXPENTRAC_CONTRAST}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="subGradient" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={EXPENTRAC_ORANGE}
                  stopOpacity={0.5}
                />
                <stop
                  offset="90%"
                  stopColor={EXPENTRAC_ORANGE}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              axisLine={tickStyle}
              dataKey="month"
              tick={tickStyle}
              tickLine={tickStyle}
            />
            <YAxis padding={{ top: 20 }} tick={tickStyle} />
            <YAxis hide yAxisId="2" />
            <Tooltip content={TooltipContent} />
            <Area
              dataKey="owed"
              fill="transparent"
              name="Owed money"
              stroke="var(--theme-light)"
              type="monotone"
              yAxisId="2"
            />
            <Area
              dataKey="total"
              fill="url(#totalGradient)"
              fillOpacity={0.5}
              name="Monthly amount"
              stroke={EXPENTRAC_GREEN}
              type="linear"
            />
            <Area
              dataKey="loan"
              fill="url(#loanGradient)"
              name="Loans"
              stroke={EXPENTRAC_CONTRAST}
              type="linear"
            />
            <Area
              dataKey="sub"
              fill="url(#subGradient)"
              name="Subscriptions"
              stroke={EXPENTRAC_ORANGE}
              type="linear"
            />
            <ReferenceLine
              label="THIS MONTH"
              stroke={EXPENTRAC_GREEN}
              x={now}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
