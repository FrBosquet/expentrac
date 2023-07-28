import { LoanAdd } from "@components/LoanAdd"
import { getUrl } from "@lib/api"
import { getUser } from "@lib/session"
import { Loan } from "@prisma/client"
import { authOptions } from "@services/auth"
import { getServerSession } from "next-auth"

const getUserLoans = async (userId: string) => {
  const url = getUrl(`loan?userId=${userId}`)

  const response = await fetch(url, { cache: 'no-store', credentials: 'include' })
  const loans: Loan[] = await response.json()

  return loans
}

export default async function Page() {
  const data = await getServerSession(authOptions)

  const user = getUser(data)

  const loans = await getUserLoans(user.id as string)

  return (
    <section className="flex-1 bg-white p-2">
      <LoanAdd />
      <h1 className="text-4xl uppercase">My<span className="text-gray-700">dashboard</span></h1>
      <h3>Your loans</h3>
      {loans.map(loan => <div key={loan.id}>{loan.name}</div>)}
    </section>
  )
}
