'use client'

import { ButtonLink } from '@components/button-link'
import { useLoan } from '@components/loan/context'
import { LoanPayplan } from '@components/loan/dashboard/payplan'
import { LoanDelete } from '@components/loan/delete'
import { LoanDetailContent } from '@components/loan/detail'
import { LoanEdit } from '@components/loan/edit'
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

  const {
    resources: { link }
  } = loan

  return (
    <>
      <h1 className="col-span-2 pb-4 text-5xl lg:col-span-4">{loan.name}</h1>
      <menu className="flex gap-2 pb-6">
        <ButtonLink href="/dashboard/loans">
          <PinLeftIcon /> Back{' '}
        </ButtonLink>
        {link ? (
          <ButtonLink href={link} target="_blank">
            <Link size={12} /> Link
          </ButtonLink>
        ) : null}
        <LoanEdit
          loan={loan}
          triggerDecorator={
            <article className="flex items-center gap-2 text-xs">
              <Edit size={12} /> Edit
            </article>
          }
        />
        <LoanDelete
          loan={loan}
          sideEffect={async () => {
            push('/dashboard/loans')
          }}
          triggerDecorator={
            <article className="flex items-center gap-2 text-xs">
              <Trash size={12} /> Delete
            </article>
          }
        />
      </menu>
      <LoanDetailContent className="col-span-2 lg:col-span-4" loan={loan} />
      <Separator className="col-span-2 lg:col-span-4" />
      <LoanPayplan className="col-span-2 my-4" loan={loan} />
    </>
  )
}
