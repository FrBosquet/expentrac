import { type ReactNode } from 'react'
import {
  prefetchDashboard,
  type DashboardResource
} from '@lib/server/dashboard-prefetch'
import { DashboardDataBoundary } from './data-boundary'
import { PrivateHydration } from './private-hydration'

export async function DashboardHydration({
  resources,
  children
}: {
  resources: readonly DashboardResource[]
  children: ReactNode
}) {
  const state = await prefetchDashboard(resources)
  return (
    <PrivateHydration state={state}>
      <DashboardDataBoundary>{children}</DashboardDataBoundary>
    </PrivateHydration>
  )
}
