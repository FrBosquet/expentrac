import { Tooltip } from '@components/Tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'

interface Props {
  sub: Subscription
  className?: string
}

const thisMonth = new Date()
thisMonth.setDate(1)

export const SubPeriods = ({ sub, className }: Props) => {
  const {
    periods: { all, active }
  } = sub

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Periods</CardTitle>
      </CardHeader>
      <CardContent>
        <section className="flex max-h-[500px] flex-col gap-2 overflow-y-auto">
          {all.toReversed().map((period) => {
            const { from, to, fee, id } = period
            const fromDate = new Date(from)
            const toDate = to ? new Date(to) : null
            const startFormatted = fromDate.toLocaleDateString('default', {
              year: '2-digit',
              month: 'short'
            })
            const endFormatted =
              toDate?.toLocaleDateString('default', {
                year: '2-digit',
                month: 'short'
              }) ?? 'ongoing'
            const priceFormatted = euroFormatter.format(fee)

            const isActiveOne = id === active?.id

            const tooltipContent = (
              <aside>
                <p>{isActiveOne ? 'Currently active' : 'Past period'}</p>
              </aside>
            )

            return (
              <Tooltip key={id} tooltip={tooltipContent}>
                <article
                  className={cn(
                    'flex gap-2 justify-between font-semibold uppercase text-xs text-slate-400',
                    isActiveOne && 'text-expentrac-800'
                  )}
                >
                  <div>
                    {startFormatted} - {endFormatted}
                  </div>
                  <div>{priceFormatted}/mo</div>
                </article>
              </Tooltip>
            )
          })}
        </section>
      </CardContent>
    </Card>
  )
}
