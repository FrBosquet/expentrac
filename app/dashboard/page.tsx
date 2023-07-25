import { Logo } from "@components/Logo"
import { SignOutButton } from "@components/SIgnOutButton"
import { hasUser } from '@lib/session'
import { authOptions } from "@services/auth"
import { prisma } from "@services/prisma"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const getUserLoans = async (userId: string) => {
  const loans = await prisma.loan.findMany({
    where: {
      userId,
    },
  })

  return loans
}

export default async function Page() {
  const data = await getServerSession(authOptions)

  if (!hasUser(data)) {
    redirect('/')
  }

  const { user } = data

  const loans = await getUserLoans(user.id as string)

  return (
    <main className="flex flex-col min-h-screen">
      <header className="flex gap-4 bg-white p-2 justify-between items-center border-b border-gray-300">
        <Logo className="text-4xl">et</Logo>
        <SignOutButton />
        <img src={user.image as string} alt={user.name as string} className="rounded-full w-12 h-12" />
      </header>

      <section className="flex-1 bg-white p-2">
        <h1 className="text-4xl uppercase">My<span className="text-gray-700">dashboard</span></h1>
        <h3>Your loans</h3>
        {loans.map(loan => <div key={loan.id}>{loan.name}</div>)}
      </section>

      <footer className="flex gap-4 bg-white p-2 justify-between items-center border-t border-gray-300">
        footer
      </footer>
    </main>
  )
}
