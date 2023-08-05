import { Logo } from "@components/Logo"
import { SignOutButton } from "@components/SIgnOutButton"
import { Menu } from "@components/user/Menu"
import { hasUser } from '@lib/session'
import { authOptions } from "@services/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

type Props = {
  children: React.ReactNode
}

export default async function Layout({ children }: Props) {
  const data = await getServerSession(authOptions)

  if (!hasUser(data)) {
    redirect('/')
  }

  const { user } = data

  return <main className="flex flex-col min-h-screen">
    <header className="flex gap-4 bg-white p-2 justify-between items-center border-b border-gray-300">
      <Logo className="text-4xl -tracking-widest px-2">et</Logo>
      <SignOutButton />
      <Menu user={user} />
    </header>

    {children}

    <footer className="flex gap-4 bg-white p-2 justify-between items-center border-t border-gray-300">
      footer
    </footer>
  </main>
};