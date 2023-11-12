'use client'

import { ButtonLink } from '@components/button-link'
import { useSub } from '@components/subscription/context'
import { SubPayplan } from '@components/subscription/dashboard/payplan'
import { SubDelete } from '@components/subscription/delete'
import { SubDetailContent } from '@components/subscription/detail'
import { SubEdit } from '@components/subscription/edit'
import { PinLeftIcon } from '@radix-ui/react-icons'
import { Edit, Link, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

export default function Page() {
  const { push } = useRouter()
  const params = useParams()
  const id = params.id
  const { sub } = useSub(id as string)

  if (!sub) return null

  const { resources: { link } } = sub

  return <>
    <h1 className='col-span-2 lg:col-span-4 text-5xl pb-4'>{sub.name}</h1>
    <menu className='flex gap-2 pb-6'>
      <ButtonLink href='/dashboard/subscriptions'><PinLeftIcon /> Back </ButtonLink>
      {
        link
          ? <ButtonLink target='_blank' href={link}>
            <Link size={12} /> Link
          </ButtonLink>
          : null}
      <SubEdit sub={sub} triggerDecorator={<article className="text-xs flex items-center gap-2"><Edit size={12} /> Edit</article>} />
      <SubDelete sideEffect={async () => {
        push('/dashboard/subscriptions')
      }} triggerDecorator={<article className="text-xs flex items-center gap-2"><Trash size={12} /> Delete</article>} sub={sub} />
    </menu>
    <SubDetailContent sub={sub} className='col-span-2 lg:col-span-4' />
    <SubPayplan className='col-span-2 my-4' sub={sub} />
  </>
}
