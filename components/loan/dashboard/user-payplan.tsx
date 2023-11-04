import { Tooltip } from '@components/Tooltip'
import { useDate } from '@components/date/context'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { contractEnds, contractMonthsPassed, contractOnGoing, contractStarts, now } from '@lib/dates'
import { type Loan } from '@lib/loan'
import { TrendingDown, TrendingUp, User } from 'lucide-react'
import { useMemo } from 'react'

interface Props {
  loans: Loan[]
  className?: string
}

export const UserLoanPayplan = ({ loans, className }: Props) => {
  const { date, setDate } = useDate()

  const payplan = useMemo(() => {
    return new Array(12).fill(null).map((_, index) => {
      const refDate = new Date(date)
      refDate.setMonth(refDate.getMonth() + index)

      const startingLoans: Loan[] = []
      const finishingLoans: Loan[] = []
      const activeLoans: Loan[] = []
      let monthlyPay: number = 0
      let monthlyHolderFee: number = 0
      let owed = 0

      loans.forEach(loan => {
        const { contract, fee, amount } = loan
        const isOngoing = contractOnGoing(contract, refDate)
        const startsThisMonth = contractStarts(contract, refDate)
        const endsThisMonth = contractEnds(contract, refDate)

        if (isOngoing || startsThisMonth || endsThisMonth) {
          activeLoans.push(loan)

          if (startsThisMonth) startingLoans.push(loan)
          if (endsThisMonth) finishingLoans.push(loan)

          monthlyPay += startsThisMonth ? fee.initial : fee.monthly
          monthlyHolderFee += startsThisMonth ? fee.holderInitial : fee.holderMonthly

          owed += amount.total - fee.initial - fee.monthly * contractMonthsPassed(contract, refDate)
        }
      })

      const hasStartingLoans = startingLoans.length > 0
      const hasFinishingLoans = finishingLoans.length > 0
      const hasSharedLoans = activeLoans.some(loan => loan.shares.isShared)

      return {
        loans: activeLoans,
        startingLoans,
        finishingLoans,
        date: refDate,
        monthlyPay,
        monthlyHolderFee,
        owed,
        hasStartingLoans,
        hasFinishingLoans,
        hasSharedLoans
      }
    })
  }, [loans])

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
              startingLoans,
              finishingLoans,
              hasStartingLoans,
              hasFinishingLoans,
              hasSharedLoans
            } = month

            const isPassed = month.date < now

            const tooltipContent = <aside>
              {
                hasSharedLoans
                  ? <p className='pb-4 flex items-center gap-2 text-xs'><User size={14} />You have some shared loans this month</p>
                  : null
              }
              <p className='flex'>Monthly pay: <strong className='flex-1 pl-4 inline-block text-right'>{euroFormatter.format(monthlyPay)}</strong></p>
              <p className='flex'>Holder fee: <strong className='flex-1 pl-4 inline-block text-right'>{euroFormatter.format(monthlyHolderFee)}</strong></p>
              <p className='flex'>Owed: <strong className='flex-1 pl-4 inline-block text-right'>{euroFormatter.format(owed)}</strong></p>

              {
                startingLoans.length > 0
                  ? <section>
                    <h3 className='pt-2 pb-1 font-semibold text-theme-light flex items-center gap-2'><TrendingUp size={14} /> Starting loans</h3>
                    <ul>
                      {
                        startingLoans.map((loan, index) => {
                          return <li className='uppercase text-xs pl-2 text-theme-accent' key={index}>{loan.name}</li>
                        })
                      }
                    </ul>
                  </section>
                  : null
              }

              {
                finishingLoans.length > 0
                  ? <section>
                    <h3 className='pt-2 pb-1 font-semibold text-theme-light flex items-center gap-2'><TrendingDown size={14} />Finishing loans</h3>
                    <ul>
                      {
                        finishingLoans.map((loan, index) => {
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
                  {hasStartingLoans ? <TrendingUp className='text-theme-accent' size={14} /> : null}
                  {hasFinishingLoans ? <TrendingDown size={14} /> : null}
                  {hasSharedLoans ? <User size={14} /> : null}
                  {euroFormatter.format(monthlyHolderFee)} <span className='text-xs opacity-70'>({euroFormatter.format(owed)} left)</span></p>
              </article>
            </Tooltip>
          })
        }
      </section>
    </CardContent>
  </Card>
}
