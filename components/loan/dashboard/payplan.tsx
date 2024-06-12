import { useDate } from '@components/date/context'
import { Tooltip } from '@components/Tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { type Loan } from '@lib/loan'

interface Props {
  loan: Loan
  className?: string
}

export const LoanPayplan = ({ loan, className }: Props) => {
  const { date } = useDate()
  const {
    startDate,
    fee,
    payments,
    amount: { total }
  } = loan

  const payplan = new Array(payments.total).fill(null).map((_, index) => {
    if (index === 0) {
      return {
        date: startDate,
        amount: fee.initial,
        acc: fee.initial
      }
    } else {
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + index)
      return {
        date,
        amount: fee.monthly,
        acc: fee.initial + fee.monthly * index
      }
    }
  })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Payment plan</CardTitle>
      </CardHeader>
      <CardContent>
        <section className="flex max-h-[500px] flex-col gap-2 overflow-y-auto">
          {payplan.map((payment, index) => {
            const { date: paymentDate, amount, acc } = payment
            const isPaid = paymentDate < date
            const isFirst = index === 0
            const isLast = index === payplan.length - 1
            const isThisMonth =
              paymentDate.getMonth() === date.getMonth() &&
              paymentDate.getFullYear() === date.getFullYear()

            const tooltipContent = (
              <aside>
                <p>Paid: {euroFormatter.format(acc)}</p>
              </aside>
            )

            return (
              <Tooltip key={index} tooltip={tooltipContent}>
                <article
                  className="flex flex-row items-center justify-between p-1 hover:bg-theme-back data-[paid=true]:text-expentrac-800"
                  data-paid={isPaid}
                >
                  <p className="text-xs font-semibold uppercase">
                    {paymentDate.toLocaleDateString('default', {
                      day: '2-digit',
                      month: 'short',
                      year:
                        paymentDate.getFullYear() !== date.getFullYear()
                          ? '2-digit'
                          : undefined
                    })}
                    {isFirst ? (
                      <span className="text-xs opacity-70">
                        {' '}
                        (initial payment)
                      </span>
                    ) : null}
                    {isLast ? (
                      <span className="text-xs opacity-70">
                        {' '}
                        (last payment)
                      </span>
                    ) : null}
                    {isThisMonth ? (
                      <span className="text-xs opacity-70"> (this month)</span>
                    ) : null}
                  </p>
                  <p>
                    {euroFormatter.format(amount)}{' '}
                    <span className="text-xs opacity-70">
                      ({euroFormatter.format(total - acc)} left)
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
