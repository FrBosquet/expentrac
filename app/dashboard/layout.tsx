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
import { hasUser } from '@lib/session'
import { authOptions } from '@services/auth'
import { getUserLoans, getUserProviders, getUserSubscriptions } from '@services/sdk'
import { getUserLoanShares } from '@services/sdk/loanShare'
import { getUserNotifications } from '@services/sdk/notifications'
import { getUserSubscriptionShares } from '@services/sdk/subscriptionShare'
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
    getUserProviders(user.id),
    getUserLoans(user.id),
    getUserSubscriptions(user.id),
    getUserLoanShares(user.id),
    getUserSubscriptionShares(user.id),
    getUserNotifications(user.id)
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
