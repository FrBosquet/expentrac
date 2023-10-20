import { DashboardLayout } from '@components/NavigationMenu'
import { DateProvider } from '@components/date/context'
import { NotificationsProvider } from '@components/notifications/context'
import { ProvidersProvider } from '@components/provider/context'
import { SubscriptionSharesProvider } from '@components/subscription-share/context'
import { SubsProvider } from '@components/subscription/context'
import { authOptions } from '@lib/auth'
import { hasUser } from '@lib/session'
import { loanSdk, notificationSdk, subscriptionSdk, subscriptionShareSdk, userProviderSdk } from '@sdk'
import { shareSdk } from '@sdk/share'
import { StoreProvider } from '@store'
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
    shares,
    subShares,
    notifications
  ] = await Promise.all([
    userProviderSdk.get(user.id),
    loanSdk.get(user.id),
    subscriptionSdk.get(user.id),
    shareSdk.get(user.id),
    subscriptionShareSdk.get(user.id),
    notificationSdk.get(user.id)
  ])

  return (
    <SubscriptionSharesProvider serverValue={subShares}>
      <ProvidersProvider serverValue={providers} >
        <SubsProvider serverValue={subs}>
          <NotificationsProvider serverValue={notifications}>
            <DateProvider>
              <DashboardLayout>
                <StoreProvider serverLoans={loans} serverShares={shares}>
                  {children}
                </StoreProvider>
              </DashboardLayout>
            </DateProvider>
          </NotificationsProvider>
        </SubsProvider>
      </ProvidersProvider>
    </SubscriptionSharesProvider>
  )
};
