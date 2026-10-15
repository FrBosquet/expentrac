import { PrivateHydration } from '@components/dashboard/private-hydration'
import { prefetchDashboard } from '@lib/server/dashboard-prefetch'
import { DashboardLayout } from '@components/NavigationMenu'
import { Toaster } from '@components/ui/sonner'
import { TooltipProvider } from '@components/ui/tooltip'
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
  const state = await prefetchDashboard(['notifications'])
  return (
    <StoreProvider session={data}>
      <PrivateHydration state={state}>
        <TooltipProvider delayDuration={75}>
          <DashboardLayout>
            <Toaster />
            {children}
          </DashboardLayout>
        </TooltipProvider>
      </PrivateHydration>
    </StoreProvider>
  )
}
