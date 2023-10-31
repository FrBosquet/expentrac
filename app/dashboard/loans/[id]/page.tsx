'use client'

import { useLoan } from '@components/loan/context'
import { LoanDetailContent } from '@components/loan/detail'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()
  const id = params.id
  const { loan } = useLoan(id as string)

  if (!loan) return null

  return <>
    <h1 className='col-span-2 lg:col-span-4 text-5xl pb-8'>{loan.name}</h1>
    <LoanDetailContent loan={loan} className='col-span-2 lg:col-span-4' />
  </>
}
