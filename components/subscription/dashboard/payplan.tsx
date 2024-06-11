import { Tooltip } from '@components/Tooltip'
import { useDate } from '@components/date/context'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { isInSameMont } from '@lib/dates'
import { type Subscription } from '@lib/sub'

interface Props {
  sub: Subscription
  className?: string
}

const thisMonth = new Date()
thisMonth.setDate(1)
const today = new Date()

export const SubPayplan = ({ sub, className }: Props) => {
  const { date } = useDate()

  const payplan: Array<{ date: Date, amount: number }> = new Array(12).fill(null).reduce((acc, _, index) => {
    const step = new Date(date)
    step.setMonth(step.getMonth() + index - 10)

    const periods = sub.periods.all

    const activePeriod = periods.find(period => {
      const from = new Date(period.from)

      if (!period.to) {
        return from < step
      }

      const to = new Date(period.to)

      return from < step && to > step
    })

    if (!activePeriod) return acc

    if (activePeriod.payday) {
      step.setDate(activePeriod.payday)
    }

    const to = activePeriod.to ? new Date(activePeriod.to) : null
    let amount = activePeriod.fee

    // If ends this month and before payday, just set amoun to 0
    if (to && activePeriod.payday && isInSameMont(to, step) && to.getDate() < activePeriod.payday) {
      amount = 0
    }

    return [...acc, {
      date: step,
      amount
    }]
  }, [])

  return <Card className={className}>
    <CardHeader>
      <CardTitle>Payment history</CardTitle>
    </CardHeader>
    <CardContent>
      <section className='flex flex-col gap-2 max-h-[500px] overflow-y-auto'>
        {
          payplan.reverse().map((payment, index) => {
            const { date: paymentDate, amount } = payment

            const isPaid = paymentDate < today

            const isThisMonth = paymentDate.getMonth() === thisMonth.getMonth() && paymentDate.getFullYear() === thisMonth.getFullYear()
            const isNextMonth = paymentDate.getMonth() === thisMonth.getMonth() + 1 && paymentDate.getFullYear() === thisMonth.getFullYear()

            const tooltipContent = <aside>
              <p>Paid</p>
            </aside>

            return <Tooltip key={index} tooltip={tooltipContent}>
              <article data-paid={isPaid} className='flex flex-row justify-between items-center data-[paid=true]:text-expentrac-800 hover:bg-theme-back p-1 text-xs font-semibold uppercase'>
                <p>
                  {paymentDate.toLocaleDateString('default', { day: '2-digit', month: 'short', year: paymentDate.getFullYear() !== date.getFullYear() ? '2-digit' : undefined })}
                  {isThisMonth ? <span className='text-xs opacity-70'> (this month)</span> : null}
                  {isNextMonth ? <span className='text-xs opacity-70'> (next month)</span> : null}
                </p>
                <p>{euroFormatter.format(amount)}</p>
              </article>
            </Tooltip>
          })
        }
      </section>
    </CardContent>
  </Card>
}
