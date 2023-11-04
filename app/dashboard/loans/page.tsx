'use client'

import { useLoans } from '@components/loan/context'
import { LoanSummary } from '@components/loan/dashboard/summary'
import { UserLoanPayplan } from '@components/loan/dashboard/user-payplan'

export default function Page() {
  const { everyLoan } = useLoans()

  return (
    <>
      <LoanSummary className='col-span-2 xl:col-span-4' />
      <UserLoanPayplan loans={everyLoan} className='col-span-2 xl:col-span-4' />
    </>
  )
}
