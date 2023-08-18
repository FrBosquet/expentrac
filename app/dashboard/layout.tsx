import { Logo } from "@components/Logo"
import { Navigation } from "@components/NavigationMenu"
import { LoansProvider } from "@components/loan/Context"
import { ProvidersProvider } from "@components/provider/Context"
import { SubsProvider } from "@components/subscription/context"
import { Menu } from "@components/user/Menu"
import { hasUser } from '@lib/session'
import { getUserLoans, getUserProviders, getUserSubscriptions } from "@services/api"
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

  const [
    providers,
    loans,
    subs
  ] = await Promise.all([
    getUserProviders(user.id),
    getUserLoans(user.id),
    getUserSubscriptions(user.id),
  ])

  return <main className="flex flex-col min-h-screen">
    <header className="flex gap-4 bg-white p-2 justify-between items-center border-b border-gray-300">
      <Logo className="text-4xl -tracking-widest px-2">et</Logo>
      <Menu user={user} />
    </header>
    <Navigation />

    <ProvidersProvider serverValue={providers} >
      <LoansProvider serverValue={loans}>
        <SubsProvider serverValue={subs}>
          {children}
        </SubsProvider>
      </LoansProvider>
    </ProvidersProvider>

    <footer className="flex gap-4 bg-white p-2 justify-between items-center border-t border-gray-300">
      footer
    </footer>
  </main>
};