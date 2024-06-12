'use client'

import { useDate } from '@components/date/context'
import { useLoans } from '@components/loan/context'
import { usePayplan } from '@components/payplan/use-payplan'
import { useSubs } from '@components/subscription/context'
import { Tooltip } from '@components/Tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { now } from '@lib/dates'
import { CalendarCheck, TrendingDown, TrendingUp, User } from 'lucide-react'

interface Props {
  className?: string
}

export const UserPayplan = ({ className }: Props) => {
  const { subs } = useSubs()
  const { everyLoan } = useLoans()
  const { date, setDate } = useDate()

  const payplan = usePayplan(date, { subs, loans: everyLoan })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Payment plan</CardTitle>
      </CardHeader>
      <CardContent>
        <section className="flex max-h-[500px] flex-col gap-2 overflow-y-auto">
          {payplan.map((month, index) => {
            const {
              monthlyPay,
              monthlyHolderFee,
              owed,
              startingSubs,
              finishingSubs,
              hasStartingSubs,
              hasFinishingSubs,
              hasSharedSubs,
              startingLoans,
              finishingLoans,
              hasStartingLoans,
              hasFinishingLoans,
              hasSharedLoans,
              yearlySubs
            } = month

            const hasStarting = hasStartingLoans || hasStartingSubs
            const hasFinishing = hasFinishingLoans || hasFinishingSubs
            const hasShared = hasSharedLoans || hasSharedSubs

            const isPassed = month.date < now

            const tooltipContent = (
              <aside>
                {hasShared ? (
                  <p className="flex items-center gap-2 pb-4 text-xs">
                    <User size={14} />
                    You have some shared Loans or Subscriptions this month
                  </p>
                ) : null}
                <p className="flex">
                  Monthly pay:{' '}
                  <strong className="inline-block flex-1 pl-4 text-right">
                    {euroFormatter.format(monthlyPay)}
                  </strong>
                </p>
                <p className="flex">
                  Holder fee:{' '}
                  <strong className="inline-block flex-1 pl-4 text-right">
                    {euroFormatter.format(monthlyHolderFee)}
                  </strong>
                </p>
                <p className="flex">
                  Owed:{' '}
                  <strong className="inline-block flex-1 pl-4 text-right">
                    {euroFormatter.format(owed)}
                  </strong>
                </p>

                {hasStarting ? (
                  <section>
                    <h3 className="flex items-center gap-2 pb-1 pt-2 font-semibold text-theme-light">
                      <TrendingUp size={14} />
                      Starts
                    </h3>
                    <ul>
                      {startingLoans.map((loan, index) => {
                        return (
                          <li
                            key={index}
                            className="pl-2 text-xs uppercase text-theme-accent"
                          >
                            {loan.name} (loan)
                          </li>
                        )
                      })}
                      {startingSubs.map((sub, index) => {
                        return (
                          <li
                            key={index}
                            className="pl-2 text-xs uppercase text-theme-accent"
                          >
                            {sub.name} (subscription)
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ) : null}

                {hasFinishing ? (
                  <section>
                    <h3 className="flex items-center gap-2 pb-1 pt-2 font-semibold text-theme-light">
                      <TrendingDown size={14} />
                      Ends
                    </h3>
                    <ul>
                      {finishingLoans.map((loan, index) => {
                        return (
                          <li
                            key={index}
                            className="pl-2 text-xs uppercase text-expentrac-800"
                          >
                            {loan.name} (loan)
                          </li>
                        )
                      })}
                      {finishingSubs.map((sub, index) => {
                        return (
                          <li
                            key={index}
                            className="pl-2 text-xs uppercase text-expentrac-800"
                          >
                            {sub.name} (subscription)
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ) : null}

                {yearlySubs.length > 0 ? (
                  <section>
                    <h3 className="flex items-center gap-2 pb-1 pt-2 font-semibold text-theme-light">
                      <CalendarCheck size={14} />
                      Yearly Subs paid this month
                    </h3>
                    <ul>
                      {yearlySubs.map((sub, index) => {
                        return (
                          <li
                            key={index}
                            className="flex justify-between pl-2 text-xs uppercase text-expentrac-800"
                          >
                            <h3>{sub.name}</h3>
                            <p>{euroFormatter.format(sub.fee.yearly)}</p>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ) : null}
              </aside>
            )

            const handleClick = () => {
              setDate(month.date)
            }

            // TODO: Extract the tooltip to a shared component
            return (
              <Tooltip key={index} tooltip={tooltipContent}>
                <article
                  className="flex flex-row items-center justify-between p-1 hover:bg-theme-back data-[passed=true]:text-expentrac-800"
                  data-passed={isPassed}
                  onClick={handleClick}
                >
                  <p className="text-xs font-semibold uppercase">
                    {month.date.toLocaleDateString('default', {
                      month: 'short',
                      year: '2-digit'
                    })}
                  </p>
                  <p className="flex items-center gap-2">
                    {yearlySubs.length > 0 ? <CalendarCheck size={14} /> : null}
                    {hasStarting ? (
                      <TrendingUp className="text-theme-accent" size={14} />
                    ) : null}
                    {hasFinishing ? <TrendingDown size={14} /> : null}
                    {hasShared ? <User size={14} /> : null}
                    {euroFormatter.format(monthlyHolderFee)}
                  </p>
                </article>
              </Tooltip>
            )
          })}
        </section>
      </CardContent>
    </Card>
  )
}
