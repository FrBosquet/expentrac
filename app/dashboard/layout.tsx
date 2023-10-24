import { DashboardLayout } from '@components/NavigationMenu'
import { authOptions } from '@lib/auth'
import { hasUser } from '@lib/session'
import { notificationSdk } from '@sdk'
import { contractSdk } from '@sdk/contract'
import { providerOnContractSdk } from '@sdk/provider-on-contract'
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
    shares,
    notifications,
    providersOnContracts
  ] = await Promise.all([
    contractSdk.get(user.id),
    shareSdk.get(user.id),
    notificationSdk.get(user.id),
    providerOnContractSdk.get(user.id)
  ])

  return (
    <DashboardLayout>
      <StoreProvider shares={shares} contracts={contracts} notifications={notifications} providersOnContracts={providersOnContracts}>
        {children}
      </StoreProvider>
    </DashboardLayout>
  )
};
