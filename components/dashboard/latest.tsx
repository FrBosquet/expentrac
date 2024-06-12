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

const MAX_ASSETS = 5

export const Latest = ({ className }: Props) => {
  const { pastContracts, futureContracts } = useSummary()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>Recent activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col-reverse gap-6 md:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <h2 className="pb-3 text-center text-sm uppercase text-expentrac-800">
              Latest
            </h2>
            {pastContracts
              .reverse()
              .slice(0, MAX_ASSETS)
              .map((contract) => (
                <Asset key={contract.id} withDate contract={contract} />
              ))}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <h2 className="pb-3 text-center text-sm uppercase text-theme-accent">
              Upcoming
            </h2>
            {futureContracts.slice(0, MAX_ASSETS).map((contract) => (
              <Asset key={contract.id} past withDate contract={contract} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
