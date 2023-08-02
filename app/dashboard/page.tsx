import { Summary } from "@components/Summary"
import { LoanAdd } from "@components/loan/LoanAdd"
import { LoanRow } from "@components/loan/LoanRow"
import { SubscriptionAdd } from "@components/subscription/SubscriptionAdd"
import { SubscriptionRow } from "@components/subscription/SubscriptionRow"
import { getUrl } from "@lib/api"
import { getUser } from "@lib/session"
import { Loan, Subscription } from "@prisma/client"
import { authOptions } from "@services/auth"
import { getServerSession } from "next-auth"

const getUserLoans = async (userId: string) => {
  const url = getUrl(`loan?userId=${userId}`)

  const response = await fetch(url, { cache: 'no-store', credentials: 'include' })
  const loans: Loan[] = await response.json()

  return loans
}

const getUserSubscriptions = async (userId: string) => {
  const url = getUrl(`subscription?userId=${userId}`)

  const response = await fetch(url, { cache: 'no-store', credentials: 'include' })
  const subscriptions: Subscription[] = await response.json()

  return subscriptions
}

export default async function Page() {
  const data = await getServerSession(authOptions)

  const user = getUser(data)
  const userId = user.id as string

  const loans = await getUserLoans(userId)
  const subscriptions = await getUserSubscriptions(userId)

  return (
    <section className="flex-1 bg-white w-screen max-w-3xl p-12 mx-auto">
      <Summary loans={loans} subs={subscriptions} />
      <menu className="flex gap-2 p-2">
        <LoanAdd />
        <SubscriptionAdd />
      </menu>

      {loans.length > 0 && <h3 className="p-2 text-xl text-primary">Your loans:</h3>}
      <ul className="flex flex-col gap-2 py-2">
        {loans.map(loan => <LoanRow key={loan.id} loan={loan} />)}
      </ul>

      {
        subscriptions.length > 0 && <h3 className="p-2 text-xl mt-4 text-primary">Your subscriptions:</h3>
      }
      <ul>
        {subscriptions.map(sub => <SubscriptionRow key={sub.id} sub={sub} />)}
      </ul>
    </section>
  )
}
