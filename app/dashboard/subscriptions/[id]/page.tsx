'use client'

import { ButtonLink } from '@components/button-link'
import { ProviderLogo } from '@components/provider/ProviderLogo'
import { useSub } from '@components/subscription/context'
import { SubPayplan } from '@components/subscription/dashboard/payplan'
import { SubPeriods } from '@components/subscription/dashboard/periods'
import { SubDelete } from '@components/subscription/delete'
import { SubDetailContent } from '@components/subscription/detail'
import { SubEdit } from '@components/subscription/edit'
import { SubPause } from '@components/subscription/pause'
import { SubResume } from '@components/subscription/resume'
import { SubUpdatePrice } from '@components/subscription/update-price'
import { PinLeftIcon } from '@radix-ui/react-icons'
import { CalendarCheck2, Edit, Link, Pause, Trash } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()
  const id = params.id
  const { sub } = useSub(id as string)

  if (!sub) return null

  const { resources: { link }, periods: { isInactive, isActive } } = sub

  return <>
    <h1 className='col-span-2 xl:col-span-4 text-5xl pb-4 flex gap-4 items-center'>
      <ProviderLogo className='size-8' provider={sub.providers.vendor} Default={CalendarCheck2} />
      {sub.name}
      {isInactive && <span className='text-gray-500'>(Paused)</span>}
    </h1>
    <menu className='flex gap-2 pb-6 col-span-2 xl:col-span-4 overflow-x-auto'>
      <ButtonLink href='/dashboard/subscriptions'><PinLeftIcon /> Back </ButtonLink>
      {
        link
          ? <ButtonLink target='_blank' href={link}>
            <Link size={12} /> Link
          </ButtonLink>
          : null}
      <SubEdit sub={sub} triggerDecorator={<article className="text-xs flex items-center gap-2"><Edit size={12} /> Edit</article>} />
      {isActive
        ? <SubPause sub={sub}>
          <article className='text-xs flex items-center gap-2'><Pause size={12} /> Pause</article>
        </SubPause>
        : <SubResume sub={sub} />}
      {isActive && <SubUpdatePrice sub={sub} />}
      <SubDelete sub={sub} afterDeleteUrl='/dashboard/subscriptions'
      ><article className="text-xs flex items-center gap-2"><Trash size={12} /> Delete</article></SubDelete>
    </menu>
    <SubDetailContent sub={sub} className='col-span-2 xl:col-span-4' />
    <SubPayplan className='col-span-2 mt-4' sub={sub} />
    <SubPeriods className='col-span-2 mt-0 xl:mt-4' sub={sub} />
  </>
}
