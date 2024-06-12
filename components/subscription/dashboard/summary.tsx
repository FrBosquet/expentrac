'use client'

import { useDate } from '@components/date/context'
import { Button } from '@components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/ui/card'
import { getTimeDescription } from '@lib/dates'
import { useState } from 'react'

import { SubscriptionAdd } from '../add'
import { useSubs } from '../context'
import { COLUMN, SubItem } from '../item'

interface Props {
  className?: string
}

export const SubscriptionSummary = ({ className }: Props) => {
  const { date, month } = useDate()
  const [activeColumn, setActiveColumn] = useState(COLUMN.FEE)
  const { allSubs } = useSubs()

  const ongoingSubs = allSubs.filter((sub) => {
    return sub.time.isOngoing
  })

  const sortedSubs = ongoingSubs.sort((a, b) => {
    if (!a.time?.currentMonthPaymentDate) return 1
    if (!b.time?.currentMonthPaymentDate) return -1

    return (
      a.time?.currentMonthPaymentDate?.getTime() -
      b.time.currentMonthPaymentDate?.getTime()
    )
  })

  const hasSubs = ongoingSubs.length > 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Your subscription summary</CardTitle>
        <CardDescription>
          {getTimeDescription(date, month, 'subscription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <header className="flex justify-end gap-2 pb-4 lg:hidden">
          <Button
            disabled={activeColumn === COLUMN.DATES}
            size="sm"
            variant="secondary"
            onClick={() => {
              setActiveColumn(COLUMN.DATES)
            }}
          >
            DATES
          </Button>
          <Button
            disabled={activeColumn === COLUMN.AMOUNT}
            size="sm"
            variant="secondary"
            onClick={() => {
              setActiveColumn(COLUMN.AMOUNT)
            }}
          >
            AMOUNT
          </Button>
          <Button
            disabled={activeColumn === COLUMN.FEE}
            size="sm"
            variant="secondary"
            onClick={() => {
              setActiveColumn(COLUMN.FEE)
            }}
          >
            FEES
          </Button>
        </header>
        <header className="hidden grid-cols-[2rem_1fr_1fr_1fr_1fr] gap-2 px-1 pb-4 lg:grid">
          <p className="col-start-2 text-left text-xs uppercase text-theme-light">
            name
          </p>
          <p className="text-center text-xs uppercase text-theme-light">
            started
          </p>
          <p className="text-center text-xs uppercase text-theme-light">paid</p>
          <p className="text-right text-xs uppercase text-theme-light">fee</p>
        </header>
        {hasSubs ? (
          <div className="flex max-h-[500px] flex-col gap-3 overflow-y-auto">
            {sortedSubs.map((sub) => (
              <SubItem key={sub.id} activeColumn={activeColumn} sub={sub} />
            ))}
          </div>
        ) : (
          <div className="grid place-content-center gap-2 p-6 text-center">
            <p className="text-sm text-theme-light">
              You have no subscriptions going on in the selected month
            </p>
          </div>
        )}
        <footer className="flex justify-end pt-8">
          <SubscriptionAdd />
        </footer>
      </CardContent>
    </Card>
  )
}
