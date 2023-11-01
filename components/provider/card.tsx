'use client'

import { Card } from '@components/ui/card'
import { getAccentColor } from '@lib/provider'
import { type ProviderWithContracts } from '@store/provider-on-contract'
import { type BrandExtendedInfo } from '@types'
import { HelpCircle } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { ProviderLogo } from './ProviderLogo'
import { ProviderDetail } from './detail'

interface Props {
  provider: ProviderWithContracts
}

export const UserProviderCard = ({ provider }: Props) => {
  // Unfetched
  if (!provider.isFetched) {
    return <article className="shadow-md border rounded-md p-2 flex flex-col justify-center gap-2 items-center border-b-8 border-b-slate-500">
      <HelpCircle className="w-16 h-16 text-slate-500" />
      <h3 className="text-md whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full text-slate-500">{provider.name}</h3>
    </article>
  }

  const extendedData = provider.rawContent as unknown as BrandExtendedInfo
  const accentColor = getAccentColor(provider)

  // fetched
  return <ProviderDetail provider={provider}>
    {
      <Card className={twMerge('shadow-md border rounded-md p-4 flex flex-col justify-center gap-2 items-center border-l-4')} style={{ borderLeftColor: accentColor }}>
        <ProviderLogo provider={provider} />
        <h3 className="text-md whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full text-foreground">
          <a target="_blank" href={`https://${extendedData.domain}`} rel="noreferrer">{extendedData.name}</a>
        </h3>
      </Card>
    }
  </ProviderDetail>
}
