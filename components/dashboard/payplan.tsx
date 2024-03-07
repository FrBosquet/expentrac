'use client'

import { Tooltip } from '@components/Tooltip'
import { useDate } from '@components/date/context'
import { useLoans } from '@components/loan/context'
import { usePayplan } from '@components/payplan/use-payplan'
import { useSubs } from '@components/subscription/context'
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

  return <Card className={className}>
    <CardHeader>
      <CardTitle>Payment plan</CardTitle>
    </CardHeader>
    <CardContent>
      <section className='flex flex-col gap-2 max-h-[500px] overflow-y-auto'>
        {
          payplan.map((month, index) => {
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

            const tooltipContent = <aside>
              {
                hasShared
                  ? <p className='pb-4 flex items-center gap-2 text-xs'><User size={14} />You have some shared Loans or Subscriptions this month</p>
                  : null
              }
              <p className='flex'>Monthly pay: <strong className='flex-1 pl-4 inline-block text-right'>{euroFormatter.format(monthlyPay)}</strong></p>
              <p className='flex'>Holder fee: <strong className='flex-1 pl-4 inline-block text-right'>{euroFormatter.format(monthlyHolderFee)}</strong></p>
              <p className='flex'>Owed: <strong className='flex-1 pl-4 inline-block text-right'>{euroFormatter.format(owed)}</strong></p>

              {
                hasStarting
                  ? <section>
                    <h3 className='pt-2 pb-1 font-semibold text-theme-light flex items-center gap-2'><TrendingUp size={14} />Starts</h3>
                    <ul>
                      {
                        startingLoans.map((loan, index) => {
                          return <li className='uppercase text-xs pl-2 text-theme-accent' key={index}>{loan.name} (loan)</li>
                        })
                      }
                      {
                        startingSubs.map((sub, index) => {
                          return <li className='uppercase text-xs pl-2 text-theme-accent' key={index}>{sub.name} (subscription)</li>
                        })
                      }
                    </ul>
                  </section>
                  : null
              }

              {
                hasFinishing
                  ? <section>
                    <h3 className='pt-2 pb-1 font-semibold text-theme-light flex items-center gap-2'><TrendingDown size={14} />Ends</h3>
                    <ul>
                      {
                        finishingLoans.map((loan, index) => {
                          return <li className='uppercase text-xs pl-2 text-expentrac-800' key={index}>{loan.name} (loan)</li>
                        })
                      }
                      {
                        finishingSubs.map((sub, index) => {
                          return <li className='uppercase text-xs pl-2 text-expentrac-800' key={index}>{sub.name} (subscription)</li>
                        })
                      }
                    </ul>
                  </section>
                  : null
              }

              {
                yearlySubs.length > 0
                  ? <section>
                    <h3 className='pt-2 pb-1 font-semibold text-theme-light flex items-center gap-2'><CalendarCheck size={14} />Yearly Subs paid this month</h3>
                    <ul>
                      {
                        yearlySubs.map((sub, index) => {
                          return <li className='uppercase text-xs pl-2 text-expentrac-800 flex justify-between' key={index}>
                            <h3>{sub.name}</h3>
                            <p>{euroFormatter.format(sub.fee.yearly)}</p>
                          </li>
                        })
                      }
                    </ul>
                  </section>
                  : null
              }
            </aside>

            const handleClick = () => {
              setDate(month.date)
            }

            // TODO: Extract the tooltip to a shared component
            return <Tooltip key={index} tooltip={tooltipContent}>
              <article onClick={handleClick} data-passed={isPassed} className='flex flex-row justify-between items-center data-[passed=true]:text-expentrac-800 hover:bg-theme-back p-1'>
                <p className='text-xs font-semibold uppercase'>
                  {month.date.toLocaleDateString('default', { month: 'short', year: '2-digit' })}
                </p>
                <p className='flex items-center gap-2'>
                  {yearlySubs.length > 0 ? <CalendarCheck size={14} /> : null}
                  {hasStarting ? <TrendingUp className='text-theme-accent' size={14} /> : null}
                  {hasFinishing ? <TrendingDown size={14} /> : null}
                  {hasShared ? <User size={14} /> : null}
                  {euroFormatter.format(monthlyHolderFee)}</p>
              </article>
            </Tooltip>
          })
        }
      </section>
    </CardContent>
  </Card>
}
