import { Footer } from '@components/Footer'
import { Logo } from '@components/Logo'
import { Navigation } from '@components/NavigationMenu'
import { DateProvider } from '@components/date/context'
import { LoanSharesProvider } from '@components/loan-share/context'
import { LoansProvider } from '@components/loan/context'
import { NotificationsProvider } from '@components/notifications/context'
import { ProvidersProvider } from '@components/provider/context'
import { SubscriptionSharesProvider } from '@components/subscription-share/context'
import { SubsProvider } from '@components/subscription/context'
import { Menu } from '@components/user/Menu'
import { authOptions } from '@lib/auth'
import { hasUser } from '@lib/session'
import { loanSdk, loanShareSdk, notificationSdk, subscriptionSdk, subscriptionShareSdk, userProviderSdk } from '@sdk'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

interface Props {
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
    subs,
    loanShares,
    subShares,
    notifications
  ] = await Promise.all([
    userProviderSdk.get(user.id),
    loanSdk.get(user.id),
    subscriptionSdk.get(user.id),
    loanShareSdk.get(user.id),
    subscriptionShareSdk.get(user.id),
    notificationSdk.get(user.id)
  ])

  return (
    <LoanSharesProvider serverValue={loanShares}>
      <SubscriptionSharesProvider serverValue={subShares}>
        <ProvidersProvider serverValue={providers} >
          <LoansProvider serverValue={loans}>
            <SubsProvider serverValue={subs}>
              <NotificationsProvider serverValue={notifications}>
                <DateProvider>
                  <main className="flex flex-col min-h-screen">
                    <header className="flex gap-4 bg-slate-900 p-2 justify-between items-center border-b border-gray-300">
                      <Logo className="text-4xl -tracking-widest px-2">et</Logo>
                      <Menu user={user} />
                    </header>
                    <Navigation />
                    {children}
                    <Footer />
                  </main >
                </DateProvider>
              </NotificationsProvider>
            </SubsProvider>
          </LoansProvider>
        </ProvidersProvider>
      </SubscriptionSharesProvider>
    </LoanSharesProvider>
  )
};
