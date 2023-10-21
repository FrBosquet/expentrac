import { DashboardLayout } from '@components/NavigationMenu'
import { NotificationsProvider } from '@components/notifications/context'
import { ProvidersProvider } from '@components/provider/context'
import { SubscriptionSharesProvider } from '@components/subscription-share/context'
import { authOptions } from '@lib/auth'
import { hasUser } from '@lib/session'
import { notificationSdk, subscriptionShareSdk, userProviderSdk } from '@sdk'
import { contractSdk } from '@sdk/contract'
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
    contracts,
    providers,
    shares,
    subShares,
    notifications
  ] = await Promise.all([
    contractSdk.get(user.id),
    userProviderSdk.get(user.id),
    shareSdk.get(user.id),
    subscriptionShareSdk.get(user.id),
    notificationSdk.get(user.id)
  ])

  return (
    <SubscriptionSharesProvider serverValue={subShares}>
      <ProvidersProvider serverValue={providers} >
        <NotificationsProvider serverValue={notifications}>
          <DashboardLayout>
            <StoreProvider shares={shares} contracts={contracts}>
              {children}
            </StoreProvider>
          </DashboardLayout>
        </NotificationsProvider>
      </ProvidersProvider>
    </SubscriptionSharesProvider>
  )
};
