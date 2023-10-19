'use client'

import { useLoan } from '@components/loan/context'
import { LoanEdit } from '@components/loan/edit'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()
  const id = params.id
  const { loan } = useLoan(id as string)

  if (!loan) return null

  return <>
    <h1>{loan.name}</h1>
    <LoanEdit loan={loan} />
  </>
}
