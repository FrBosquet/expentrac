'use client'

import { useSub } from '@components/subscription/context'
import { SubDetailContent } from '@components/subscription/detail'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()
  const id = params.id
  const { sub } = useSub(id as string)

  if (!sub) return null

  return <>
    <h1 className='col-span-2 lg:col-span-4 text-5xl pb-8'>{sub.name}</h1>
    <SubDetailContent sub={sub} className='col-span-2 lg:col-span-4' />
  </>
}
