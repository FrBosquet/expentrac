'use client'

import { Card } from '@components/ui/card'
import { getAccentColor } from '@lib/provider'
import { type ProviderWithContracts } from '@store/provider-on-contract'
import { type BrandExtendedInfo } from '@types'
import { HelpCircle } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import { ProviderDetail } from './detail'
import { ProviderLogo } from './ProviderLogo'

interface Props {
  provider: ProviderWithContracts
}

export const UserProviderCard = ({ provider }: Props) => {
  // Unfetched
  if (!provider.isFetched) {
    return (
      <article className="flex flex-col items-center justify-center gap-2 rounded-md border border-b-8 border-b-slate-500 p-2 shadow-md">
        <HelpCircle className="size-16 text-slate-500" />
        <h3 className="max-w-full truncate text-base text-slate-500">
          {provider.name}
        </h3>
      </article>
    )
  }

  const extendedData = provider.rawContent as unknown as BrandExtendedInfo
  const accentColor = getAccentColor(provider)

  // fetched
  return (
    <ProviderDetail provider={provider}>
      {
        <Card
          className={twMerge(
            'shadow-md border rounded-md p-4 flex flex-col justify-center gap-2 items-center border-l-4'
          )}
          style={{ borderLeftColor: accentColor }}
        >
          <ProviderLogo provider={provider} />
          <h3 className="max-w-full truncate text-base text-foreground">
            <a
              href={`https://${extendedData.domain}`}
              rel="noreferrer"
              target="_blank"
            >
              {extendedData.name}
            </a>
          </h3>
        </Card>
      }
    </ProviderDetail>
  )
}
