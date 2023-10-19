'use client'

import { useLoan } from '@components/loan/context'
import { LoanDelete } from '@components/loan/delete'
import { LoanEdit } from '@components/loan/edit'
import { useParams, useRouter } from 'next/navigation'

export default function Page() {
  const { push } = useRouter()
  const params = useParams()
  const id = params.id
  const { loan } = useLoan(id as string)

  if (!loan) return null

  return <>
    <h1>{loan.name}</h1>
    <LoanEdit loan={loan} />
    <LoanDelete sideEffect={async () => {
      push('/dashboard/loans')
    }} loan={loan} />
  </>
}
