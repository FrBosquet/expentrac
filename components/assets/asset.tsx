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

  return <Link href={getLinkHref(contract)} className='grid grid-rows-[auto_auto] grid-cols-[auto_1fr_auto] gap-x-2 hover:opacity-80' key={id}>
    <ProviderLogo className="w-8 h-8 row-span-2 self-center" provider={vendor} Default={CalendarCheck2} />
    <h3 data-withdate={withDate} className='col-span-2 data-[withdate=true]:col-span-1 whitespace-nowrap overflow-hidden text-ellipsis'>{name}</h3>
    <p data-withdate={withDate} className='hidden data-[withdate=true]:block text-xs text-theme-light text-right uppercase' >{dateText}</p>
    <p className='text-xs self-end uppercase text-theme-light'>{type}</p>
    <p data-past={past} className='text-expentrac-800 data-[past=true]:text-theme-accent font-semibold text-right'>{euroFormatter.format(fee)}</p>
  </Link>
}
