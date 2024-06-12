'use client'

import { ProviderLogo } from '@components/provider/ProviderLogo'
import { getAssetData, type UnwrappedContract } from '@lib/asset'
import { euroFormatter } from '@lib/currency'
import { CalendarCheck2 } from 'lucide-react'
import Link from 'next/link'

interface Props {
  contract: UnwrappedContract
  past?: boolean
  withDate?: boolean
}

const getLinkHref = (contract: UnwrappedContract) => {
  const { type, id } = contract

  return `dashboard/${type.toLowerCase()}s/${id}`
}

export const Asset = ({ contract, past, withDate }: Props) => {
  const { name, vendor, type, id, fee, dateText } = getAssetData(contract)

  return (
    <Link
      key={id}
      className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] gap-x-2 hover:opacity-80"
      href={getLinkHref(contract)}
    >
      <ProviderLogo
        className="row-span-2 size-8 self-center"
        Default={CalendarCheck2}
        provider={vendor}
      />
      <h3
        className="col-span-2 truncate data-[withdate=true]:col-span-1"
        data-withdate={withDate}
      >
        {name}
      </h3>
      <p
        className="hidden text-right text-xs uppercase text-theme-light data-[withdate=true]:block"
        data-withdate={withDate}
      >
        {dateText}
      </p>
      <p className="self-end text-xs uppercase text-theme-light">{type}</p>
      <p
        className="text-right font-semibold text-expentrac-800 data-[past=true]:text-theme-accent"
        data-past={past}
      >
        {euroFormatter.format(fee)}
      </p>
    </Link>
  )
}
