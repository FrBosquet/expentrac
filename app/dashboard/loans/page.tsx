import { DateSelector } from '@components/date/selector'
import { LoanSummary } from '@components/loan/summary'

export default function page() {
  return <section className="flex-1 bg-white w-screen max-w-3xl p-12 mx-auto">
    <DateSelector />
    <LoanSummary />
  </section>
}
