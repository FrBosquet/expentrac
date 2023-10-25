import { Header } from '@components/header'
import { LoanSummary } from '@components/loan/dashboard/summary'

export default function Page() {
  return (
    <>
      <Header />
      <LoanSummary className='col-span-2 xl:col-span-4' />
    </>
  )
}
