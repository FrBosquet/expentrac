'use client'

import { useLoan } from '@components/loan/context'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()
  const id = params.id
  const { loan } = useLoan(id as string)

  return <>
    <h1>{loan.name}</h1>
  </>
}
