import { DashboardDataBoundary } from '@components/dashboard/data-boundary'

// Notifications are already prefetched by the dashboard shell for the bell.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardDataBoundary>{children}</DashboardDataBoundary>
}
