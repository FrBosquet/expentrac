import { DashboardHydration } from '@components/dashboard/hydration'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardHydration resources={['contracts', 'shares', 'providers']}>
      {children}
    </DashboardHydration>
  )
}
