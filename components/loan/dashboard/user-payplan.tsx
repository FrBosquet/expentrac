import { useDate } from '@components/date/context'
import { usePayplan } from '@components/payplan/use-payplan'
import { Tooltip } from '@components/Tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { now } from '@lib/dates'
import { type Loan } from '@lib/loan'
import { TrendingDown, TrendingUp, User } from 'lucide-react'

interface Props {
  loans: Loan[]
  className?: string
}

export const UserLoanPayplan = ({ loans, className }: Props) => {
  const { date, setDate } = useDate()

  const payplan = usePayplan(date, { loans })

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
              startingLoans,
              finishingLoans,
              hasStartingLoans,
              hasFinishingLoans,
              hasSharedLoans
            } = month

            const isPassed = month.date < now

            const tooltipContent = (
              <aside>
                {hasSharedLoans ? (
                  <p className="flex items-center gap-2 pb-4 text-xs">
                    <User size={14} />
                    You have some shared loans this month
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

                {startingLoans.length > 0 ? (
                  <section>
                    <h3 className="flex items-center gap-2 pb-1 pt-2 font-semibold text-theme-light">
                      <TrendingUp size={14} /> Starting loans
                    </h3>
                    <ul>
                      {startingLoans.map((loan, index) => {
                        return (
                          <li
                            key={index}
                            className="pl-2 text-xs uppercase text-theme-accent"
                          >
                            {loan.name}
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ) : null}

                {finishingLoans.length > 0 ? (
                  <section>
                    <h3 className="flex items-center gap-2 pb-1 pt-2 font-semibold text-theme-light">
                      <TrendingDown size={14} />
                      Finishing loans
                    </h3>
                    <ul>
                      {finishingLoans.map((loan, index) => {
                        return (
                          <li
                            key={index}
                            className="pl-2 text-xs uppercase text-expentrac-800"
                          >
                            {loan.name}
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
                    {hasStartingLoans ? (
                      <TrendingUp className="text-theme-accent" size={14} />
                    ) : null}
                    {hasFinishingLoans ? <TrendingDown size={14} /> : null}
                    {hasSharedLoans ? <User size={14} /> : null}
                    {euroFormatter.format(monthlyHolderFee)}{' '}
                    <span className="text-xs opacity-70">
                      ({euroFormatter.format(owed)} left)
                    </span>
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
