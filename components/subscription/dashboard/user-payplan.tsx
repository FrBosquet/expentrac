import { useDate } from '@components/date/context'
import { usePayplan } from '@components/payplan/use-payplan'
import { Tooltip } from '@components/Tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { now } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { TrendingDown, TrendingUp, User } from 'lucide-react'

interface Props {
  subs: Subscription[]
  className?: string
}

export const UserSubPayplan = ({ subs, className }: Props) => {
  const { date, setDate } = useDate()

  const payplan = usePayplan(date, { subs })

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
              hasSharedSubs
            } = month

            const isPassed = month.date < now

            const tooltipContent = (
              <aside>
                {hasSharedSubs ? (
                  <p className="flex items-center gap-2 pb-4 text-xs">
                    <User size={14} />
                    You have some shared Subs this month
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

                {startingSubs.length > 0 ? (
                  <section>
                    <h3 className="flex items-center gap-2 pb-1 pt-2 font-semibold text-theme-light">
                      <TrendingUp size={14} /> Starting Subs
                    </h3>
                    <ul>
                      {startingSubs.map((loan, index) => {
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

                {finishingSubs.length > 0 ? (
                  <section>
                    <h3 className="flex items-center gap-2 pb-1 pt-2 font-semibold text-theme-light">
                      <TrendingDown size={14} />
                      Finishing Subs
                    </h3>
                    <ul>
                      {finishingSubs.map((loan, index) => {
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
                    {hasStartingSubs ? (
                      <TrendingUp className="text-theme-accent" size={14} />
                    ) : null}
                    {hasFinishingSubs ? <TrendingDown size={14} /> : null}
                    {hasSharedSubs ? <User size={14} /> : null}
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
