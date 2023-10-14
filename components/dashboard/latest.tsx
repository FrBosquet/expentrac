'use client'

import { useSummary } from '@components/Summary'
import { Asset } from '@components/assets/asset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'

interface Props {
  className?: string
}

const MAX_ASSETS = 5

export const Latest = ({ className }: Props) => {
  const { pastAssets, futureAssets } = useSummary()

  return <Card className={className}>
    <CardHeader>
      <CardTitle>Payments</CardTitle>
      <CardDescription>Recent activity</CardDescription>
    </CardHeader>
    <CardContent>
      <div className='flex gap-6 flex-col-reverse md:flex-row'>
        <div className='flex-1 flex flex-col gap-2'>
          <h2 className='uppercase text-sm text-center text-expentrac-800 pb-3'>Latest</h2>
          {pastAssets
            .filter(({ date }) => {
              const today = new Date()
              const assetDate = new Date(date)

              if (assetDate.getTime() < today.getTime() - (30 * 24 * 60 * 60 * 1000)) {
                return false
              }

              return true
            })
            .reverse()
            .slice(0, MAX_ASSETS)
            .map(asset => <Asset asset={asset} withDate key={asset.id} />)}
        </div>
        <div className='flex-1 flex flex-col gap-2'>
          <h2 className='uppercase text-sm text-center text-theme-accent pb-3'>Upcoming</h2>
          {futureAssets.slice(0, MAX_ASSETS).map(asset => <Asset asset={asset} past withDate key={asset.id} />)}
        </div>
      </div>
    </CardContent>
  </Card>
}
