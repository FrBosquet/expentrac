import { Header } from '@components/header'
import { LoanSummary } from '@components/loan/summary'

export default function Page() {
  return (
    <>
      <Header />
      <LoanSummary className='col-span-2' />
    </>
  )
}
