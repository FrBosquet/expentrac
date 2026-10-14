import { DashboardDataBoundary } from '@components/dashboard/data-boundary'
import { DashboardLayout } from '@components/NavigationMenu'
import { Toaster } from '@components/ui/sonner'
import { authOptions } from '@lib/auth'
import { hasUser } from '@lib/session'
import { StoreProvider } from '@store'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'
export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const data = await getServerSession(authOptions)
  if (!hasUser(data)) redirect('/')
  return (
    <StoreProvider userId={data.user.id}>
      <DashboardLayout>
        <Toaster />
        <DashboardDataBoundary>{children}</DashboardDataBoundary>
      </DashboardLayout>
    </StoreProvider>
  )
}
