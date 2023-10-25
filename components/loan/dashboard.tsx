'use client'

import { LoanAdd } from './add'
import { useLoans } from './context'
import { LoanSummary } from './dashboard/summary'

export const LoanDashboard = () => {
  const { hasAnyLoans } = useLoans()

  return hasAnyLoans
    ? <>
      <LoanSummary />
    </>
    : <section className='flex flex-col gap-4 p-12 items-center'>
      <h1 className="text-6xl font-semibold text-center">Loans</h1>
      <p className='text-slate-700 text-center'>A loan is a financial instrument that allows you to borrow money from a bank or other financial institution, for a certain period of time, with the obligation to return it in full, with interest, in the agreed terms.</p>
      <p className='text-slate-700 text-center'>Track your first loan by clicking in the button below</p>
      <LoanAdd />
    </section>
}
