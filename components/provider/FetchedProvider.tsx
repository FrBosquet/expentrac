'use client'

import { getAccentColor } from "@lib/provider"
import { BrandExtendedInfo, ProviderFetched } from "@types"
import { ProviderLogo } from "./ProviderLogo"

type Props = {
  provider: ProviderFetched
}

export const FetchedProvider = ({ provider }: Props) => {
  const extendedData = provider.rawContent as BrandExtendedInfo
  const accentColor = getAccentColor(provider)

  return <article className='shadow-md border rounded-md p-4 flex flex-col justify-center gap-2 items-center border-b-8' style={{ borderBottomColor: accentColor }}>
    <ProviderLogo provider={provider} />
    <h3 className="text-md whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full text-slate-600">
      <a target="_blank" href={`https://${extendedData.domain}`}>{extendedData.name}</a>
    </h3>
  </article>
}