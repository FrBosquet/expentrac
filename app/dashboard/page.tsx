import { Summary } from "@components/Summary"
import { LoanSummary } from "@components/loan/summary"
import { SubscriptionSummary } from "@components/subscription/summary"

export default async function Page() {
  return (
    <section className="flex-1 bg-white w-screen max-w-3xl p-12 mx-auto">
      <Summary />
      <LoanSummary />
      <SubscriptionSummary />
    </section>
  )
}
