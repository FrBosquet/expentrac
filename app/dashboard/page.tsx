import { LoanAdd } from "@components/LoanAdd"
import { LoanRow } from "@components/LoanRow"
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
    <section className="flex-1 bg-white w-screen max-w-3xl p-12 mx-auto">
      <h1 className="text-4xl uppercase p-2">My<span className="text-gray-700">dashboard</span></h1>
      <LoanAdd />
      <h3 className="p-2 text-xl text-primary">Your loans:</h3>
      <ul className="flex flex-col gap-2 py-2">
        {loans.map(loan => <LoanRow key={loan.id} loan={loan} />)}

      </ul>
    </section>
  )
}
