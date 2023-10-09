import { Navigation } from '@components/NavigationMenu'
import { DarkModeProvider } from '@components/darkmode'
import { DateProvider } from '@components/date/context'
import { Footer } from '@components/footer'
import { Header } from '@components/header'
import { LoanSharesProvider } from '@components/loan-share/context'
import { LoansProvider } from '@components/loan/context'
import { NotificationsProvider } from '@components/notifications/context'
import { ProvidersProvider } from '@components/provider/context'
import { SubscriptionSharesProvider } from '@components/subscription-share/context'
import { SubsProvider } from '@components/subscription/context'
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
                  <DarkModeProvider>
                    <Header />
                    <Navigation />
                    {children}
                    <Footer />
                  </DarkModeProvider>
                </DateProvider>
              </NotificationsProvider>
            </SubsProvider>
          </LoansProvider>
        </ProvidersProvider>
      </SubscriptionSharesProvider>
    </LoanSharesProvider>
  )
};
