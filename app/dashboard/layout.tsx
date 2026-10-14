import { DashboardLayout } from '@components/NavigationMenu'
import { Toaster } from '@components/ui/sonner'
import { authOptions } from '@lib/auth'
import { type Contract, type ProviderOnContract, type Share } from '@lib/models'
import {
  readContracts,
  readNotifications,
  readProviderRelations,
  readShares
} from '@lib/server/reads'
import { hasUser } from '@lib/session'
import { StoreProvider } from '@store'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'

interface Props {
  children: React.ReactNode
}

export default async function Layout({ children }: Props) {
  const data = await getServerSession(authOptions)

  if (!hasUser(data)) {
    redirect('/')
  }

  const [contracts, shares, notifications, providersOnContracts] =
    await Promise.all([
      readContracts(),
      readShares(),
      readNotifications(),
      readProviderRelations()
    ])

  return (
    <DashboardLayout>
      <Toaster />
      <StoreProvider
        contracts={contracts as Contract[]}
        notifications={notifications}
        providersOnContracts={providersOnContracts as ProviderOnContract[]}
        shares={shares as Share[]}
      >
        {children}
      </StoreProvider>
    </DashboardLayout>
  )
}
