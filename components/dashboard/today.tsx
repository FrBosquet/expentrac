'use client'

import { useSummary } from '@components/Summary'
import { Asset } from '@components/assets/asset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'

interface Props {
  className?: string
}

export const Today = ({ className }: Props) => {
  const { todayAssets } = useSummary()

  const hasAssets = todayAssets.length > 0

  return <Card className={className}>
    <CardHeader>
      <CardTitle>Today</CardTitle>
      <CardDescription>You are paying for:</CardDescription>
    </CardHeader>
    <CardContent>
      {hasAssets
        ? <div className='flex flex-col gap-3'>
          {todayAssets.map((asset) => <Asset asset={asset} key={asset.id} />)}
        </div>
        : <div className='grid place-content-center gap-2 p-6 text-center'>
          <p className='text-sm text-theme-light'>You have no subscriptions to pay today</p>
        </div>
      }
    </CardContent>
  </Card>
}
