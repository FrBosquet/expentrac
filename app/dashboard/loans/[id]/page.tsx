'use client'

import { ButtonLink } from '@components/button-link'
import { useLoan } from '@components/loan/context'
import { LoanDelete } from '@components/loan/delete'
import { LoanDetailContent } from '@components/loan/detail'
import { LoanEdit } from '@components/loan/edit'
import { LoanPayplan } from '@components/payplan/loan'
import { Separator } from '@components/ui/separator'
import { PinLeftIcon } from '@radix-ui/react-icons'
import { Edit, Link, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

export default function Page() {
  const { push } = useRouter()
  const params = useParams()
  const id = params.id
  const { loan } = useLoan(id as string)

  if (!loan) return null

  const { resources: { link } } = loan

  return <>
    <h1 className='col-span-2 lg:col-span-4 text-5xl pb-4'>{loan.name}</h1>
    <menu className='flex gap-2 pb-6'>
      <ButtonLink href='/dashboard/loans'><PinLeftIcon /> Back </ButtonLink>
      {
        link
          ? <ButtonLink target='_blank' href={link}>
            <Link size={12} /> Link
          </ButtonLink>
          : null}
      <LoanEdit loan={loan} triggerDecorator={<article className="text-xs flex items-center gap-2"><Edit size={12} /> Edit</article>} />
      <LoanDelete sideEffect={async () => {
        push('/dashboard/loans')
      }} triggerDecorator={<article className="text-xs flex items-center gap-2"><Trash size={12} /> Delete</article>} loan={loan} />
    </menu>
    <LoanDetailContent loan={loan} className='col-span-2 lg:col-span-4' />
    <Separator className='col-span-2 lg:col-span-4' />
    <LoanPayplan className='col-span-2 my-4' loan={loan} />
  </>
}
