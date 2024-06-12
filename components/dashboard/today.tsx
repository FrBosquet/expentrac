'use client'

import { Asset } from '@components/assets/asset'
import { useSummary } from '@components/Summary'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/ui/card'

interface Props {
  className?: string
}

export const Today = ({ className }: Props) => {
  const { todayContracts } = useSummary()

  const hasContracts = todayContracts.length > 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Today</CardTitle>
        <CardDescription>You are paying for:</CardDescription>
      </CardHeader>
      <CardContent>
        {hasContracts ? (
          <div className="flex flex-col gap-3">
            {todayContracts.map((contract) => (
              <Asset key={contract.id} contract={contract} />
            ))}
          </div>
        ) : (
          <div className="grid place-content-center gap-2 p-6 text-center">
            <p className="text-sm text-theme-light">
              You have nothing to pay for today
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
