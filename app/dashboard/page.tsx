import { Summary } from "@components/Summary"
import { LoanSummary } from "@components/loan/LoanSummary"
import { SubscriptionSummary } from "@components/subscription/SubscriptionSummary"
import { getUrl } from "@lib/api"
import { getUser } from "@lib/session"
import { Loan, Subscription } from "@prisma/client"
import { authOptions } from "@services/auth"
import { getServerSession } from "next-auth"

const getUserLoans = async (userId: string) => {
  const url = getUrl(`loan?userId=${userId}`)

  const response = await fetch(url, { credentials: 'include' })
  const loans: Loan[] = await response.json()

  return loans
}

const getUserSubscriptions = async (userId: string) => {
  const url = getUrl(`subscription?userId=${userId}`)

  const response = await fetch(url, { credentials: 'include' })
  const subscriptions: Subscription[] = await response.json()

  return subscriptions
}

export default async function Page() {
  const data = await getServerSession(authOptions)

  const user = getUser(data)
  const userId = user.id as string

  const [loans, subscriptions] = await Promise.all([getUserLoans(userId), getUserSubscriptions(userId)])

  return (
    <section className="flex-1 bg-white w-screen max-w-3xl p-12 mx-auto">
      <Summary loans={loans} subs={subscriptions} />

      {loans.length > 0 && <LoanSummary loans={loans} />}
      {subscriptions.length > 0 && <SubscriptionSummary subscriptions={subscriptions} />}
    </section>
  )
}
