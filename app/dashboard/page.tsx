import { Summary } from '@components/Summary'
import { Header } from '@components/header'
import { LoanSummary } from '@components/loan/summary'
import { SubscriptionSummary } from '@components/subscription/summary'

export default async function Page() {
  return (
    <section className="flex-1 w-screen max-w-5xl p-6 mx-auto flex flex-col gap-1">
      <Header />
      <Summary />
      <LoanSummary />
      <SubscriptionSummary />
    </section>
  )
}
