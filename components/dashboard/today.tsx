'use client'

import { getSubSharedFee, useSummary } from '@components/Summary'
import { ProviderLogo } from '@components/provider/ProviderLogo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { getLoanExtendedInformation } from '@lib/loan'
import { type LoanComplete, type SubscriptionComplete } from '@types'
import { CalendarCheck2 } from 'lucide-react'

interface Props {
  className?: string
}

interface SubAsset {
  sub: SubscriptionComplete
  date: Date
}

interface LoanAsset {
  loan: LoanComplete
  date: Date
}

type Asset = SubAsset | LoanAsset

const isSub = (asset: Asset): asset is SubAsset => {
  return Object.hasOwnProperty.call(asset, 'sub')
}

const getAssetData = (asset: Asset) => {
  if (isSub(asset)) {
    const { id, name, vendor } = asset.sub

    const fee = getSubSharedFee(asset.sub)

    return { id, name, vendor, type: 'subscription', fee }
  } else {
    const { id, name, vendor } = asset.loan

    const { holderFee } = getLoanExtendedInformation(asset.loan) // TODO: UNIFY FUNCTIONS TO EXTEND LOAN/SUB INFO

    return { name, vendor, type: 'loan', id, fee: holderFee }
  }
}

const renderAssets = (assets: Asset[]) => {
  return assets.map((asset) => {
    const { name, vendor, type, id, fee } = getAssetData(asset)

    return <article className='grid grid-rows-[auto_auto] grid-cols-[auto_1fr_auto] gap-x-2' key={id}>
      <ProviderLogo className="w-8 h-8 row-span-2 self-center" provider={vendor?.provider} Default={CalendarCheck2} />
      <h3 className='col-span-2'>{name}</h3>
      <p className='text-xs self-end uppercase text-theme-light'>{type}</p>
      <p className='text-expentrac-800 font-semibold'>{euroFormatter.format(fee)}</p>
    </article>
  })
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
          {renderAssets(todayAssets)}
        </div>
        : <div className='grid place-content-center gap-2 p-6 text-center'>
          <p className='text-sm text-theme-light'>You have no subscriptions to pay today</p>
        </div>
      }
    </CardContent>
  </Card>
}
