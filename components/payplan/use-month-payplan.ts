import { type Loan } from '@lib/loan'
import { type Subscription } from '@lib/sub'

import { usePayplan } from './use-payplan'

export const useMonthPayplan = (
  date: Date,
  {
    loans = [],
    subs = []
  }: {
    loans?: Loan[]
    subs?: Subscription[]
  }
) => {
  const payplan = usePayplan(date, { loans, subs })

  const [currentMonth] = payplan

  return currentMonth
}
