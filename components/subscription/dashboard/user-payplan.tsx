import { Tooltip } from '@components/Tooltip'
import { useDate } from '@components/date/context'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { contractEnds, contractOnGoing, contractStarts, now } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { TrendingDown, TrendingUp, User } from 'lucide-react'
import { useMemo } from 'react'

interface Props {
  subs: Subscription[]
  className?: string
}

export const UserSubPayplan = ({ subs, className }: Props) => {
  const { date, setDate } = useDate()

  const payplan = useMemo(() => {
    return new Array(12).fill(null).map((_, index) => {
      const refDate = new Date(date)
      refDate.setMonth(refDate.getMonth() + index)

      const startingSubs: Subscription[] = []
      const finishingSubs: Subscription[] = []
      const activeSubs: Subscription[] = []
      let monthlyPay: number = 0
      let monthlyHolderFee: number = 0
      let owed = 0

      subs.forEach(sub => {
        const { contract, fee } = sub
        const isOngoing = contractOnGoing(contract, refDate)
        const startsThisMonth = contractStarts(contract, refDate)
        const endsThisMonth = contractEnds(contract, refDate)

        if (isOngoing || startsThisMonth || endsThisMonth) {
          activeSubs.push(sub)

          if (startsThisMonth) startingSubs.push(sub)
          if (endsThisMonth) finishingSubs.push(sub)

          monthlyPay += fee.monthly
          monthlyHolderFee += fee.holderMonthly

          owed += 0
        }
      })

      const hasStartingSubs = startingSubs.length > 0
      const hasFinishingSubs = finishingSubs.length > 0
      const hasSharedSubs = activeSubs.some(loan => loan.shares.isShared)

      return {
        subs: activeSubs,
        startingSubs,
        finishingSubs,
        date: refDate,
        monthlyPay,
        monthlyHolderFee,
        owed,
        hasStartingSubs,
        hasFinishingSubs,
        hasSharedSubs
      }
    })
  }, [subs])

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
              hasSharedSubs
            } = month

            const isPassed = month.date < now

            const tooltipContent = <aside>
              {
                hasSharedSubs
                  ? <p className='pb-4 flex items-center gap-2 text-xs'><User size={14} />You have some shared Subs this month</p>
                  : null
              }
              <p className='flex'>Monthly pay: <strong className='flex-1 pl-4 inline-block text-right'>{euroFormatter.format(monthlyPay)}</strong></p>
              <p className='flex'>Holder fee: <strong className='flex-1 pl-4 inline-block text-right'>{euroFormatter.format(monthlyHolderFee)}</strong></p>
              <p className='flex'>Owed: <strong className='flex-1 pl-4 inline-block text-right'>{euroFormatter.format(owed)}</strong></p>

              {
                startingSubs.length > 0
                  ? <section>
                    <h3 className='pt-2 pb-1 font-semibold text-theme-light flex items-center gap-2'><TrendingUp size={14} /> Starting Subs</h3>
                    <ul>
                      {
                        startingSubs.map((loan, index) => {
                          return <li className='uppercase text-xs pl-2 text-theme-accent' key={index}>{loan.name}</li>
                        })
                      }
                    </ul>
                  </section>
                  : null
              }

              {
                finishingSubs.length > 0
                  ? <section>
                    <h3 className='pt-2 pb-1 font-semibold text-theme-light flex items-center gap-2'><TrendingDown size={14} />Finishing Subs</h3>
                    <ul>
                      {
                        finishingSubs.map((loan, index) => {
                          return <li className='uppercase text-xs pl-2 text-expentrac-800' key={index}>{loan.name}</li>
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

            return <Tooltip key={index} tooltip={tooltipContent}>
              <article onClick={handleClick} data-passed={isPassed} className='flex flex-row justify-between items-center data-[passed=true]:text-expentrac-800 hover:bg-theme-back p-1'>
                <p className='text-xs font-semibold uppercase'>
                  {month.date.toLocaleDateString('default', { month: 'short', year: '2-digit' })}
                </p>
                <p className='flex items-center gap-2'>
                  {hasStartingSubs ? <TrendingUp className='text-theme-accent' size={14} /> : null}
                  {hasFinishingSubs ? <TrendingDown size={14} /> : null}
                  {hasSharedSubs ? <User size={14} /> : null}
                  {euroFormatter.format(monthlyHolderFee)}</p>
              </article>
            </Tooltip>
          })
        }
      </section>
    </CardContent>
  </Card>
}
