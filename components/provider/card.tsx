'use client'

import { getAccentColor } from "@lib/provider"
import { BrandExtendedInfo, UserProviderComplete } from "@types"
import { HelpCircle } from "lucide-react"
import { ProviderDetail } from "./detail"
import { ProviderLogo } from "./logo"

type Props = {
  userProvider: UserProviderComplete
}

export const UserProviderCard = ({ userProvider }: Props) => {
  const { provider } = userProvider

  // Unfetched
  if (!provider.isFetched) {
    return <article className="shadow-md border rounded-md p-2 flex flex-col justify-center gap-2 items-center border-b-8 border-b-slate-500">
      <HelpCircle className="w-16 h-16 text-slate-500" />
      <h3 className="text-md whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full text-slate-500">{provider.name}</h3>
    </article>
  }

  const extendedData = provider.rawContent as BrandExtendedInfo
  const accentColor = getAccentColor(provider)

  // fetched
  return <ProviderDetail userProvider={userProvider}>
    {
      <article className='shadow-md border rounded-md p-4 flex flex-col justify-center gap-2 items-center border-b-8' style={{ borderBottomColor: accentColor }}>
        <ProviderLogo provider={provider} />
        <h3 className="text-md whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full text-slate-600">
          <a target="_blank" href={`https://${extendedData.domain}`}>{extendedData.name}</a>
        </h3>
      </article>
    }
  </ProviderDetail>
}