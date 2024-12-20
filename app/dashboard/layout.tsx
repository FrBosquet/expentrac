import { DashboardLayout } from '@components/NavigationMenu'
import { Toaster } from '@components/ui/sonner'
import { authOptions } from '@lib/auth'
import { hasUser } from '@lib/session'
import { notificationSdk } from '@sdk'
import { contractSdk } from '@sdk/contract'
import { providerOnContractSdk } from '@sdk/provider-on-contract'
import { shareSdk } from '@sdk/share'
import { StoreProvider } from '@store'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

interface Props {
  children: React.ReactNode
}

export default async function Layout({ children }: Props) {
  const data = await getServerSession(authOptions)

  if (!hasUser(data)) {
    redirect('/')
  }

  const { user } = data

  const [contracts, shares, notifications, providersOnContracts] =
    await Promise.all([
      contractSdk.get(user.id),
      shareSdk.get(user.id),
      notificationSdk.get(user.id),
      providerOnContractSdk.get(user.id)
    ])

  return (
    <DashboardLayout>
      <Toaster />
      <StoreProvider
        contracts={contracts}
        notifications={notifications}
        providersOnContracts={providersOnContracts}
        shares={shares}
      >
        {children}
      </StoreProvider>
    </DashboardLayout>
  )
}
