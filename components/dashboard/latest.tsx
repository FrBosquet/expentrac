'use client'

import { useSummary } from '@components/Summary'
import { Asset } from '@components/assets/asset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'

interface Props {
  className?: string
}

const MAX_ASSETS = 5

export const Latest = ({ className }: Props) => {
  const { pastContracts, futureContracts } = useSummary()

  return <Card className={className}>
    <CardHeader>
      <CardTitle>Payments</CardTitle>
      <CardDescription>Recent activity</CardDescription>
    </CardHeader>
    <CardContent>
      <div className='flex gap-6 flex-col-reverse md:flex-row'>
        <div className='flex-1 flex flex-col gap-2'>
          <h2 className='uppercase text-sm text-center text-expentrac-800 pb-3'>Latest</h2>
          {pastContracts
            .reverse()
            .slice(0, MAX_ASSETS)
            .map(contract => <Asset contract={contract} withDate key={contract.id} />)}
        </div>
        <div className='flex-1 flex flex-col gap-2'>
          <h2 className='uppercase text-sm text-center text-theme-accent pb-3'>Upcoming</h2>
          {futureContracts.slice(0, MAX_ASSETS).map(contract => <Asset contract={contract} past withDate key={contract.id} />)}
        </div>
      </div>
    </CardContent>
  </Card>
}
