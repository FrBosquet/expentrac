import { DashboardHydration } from '@components/dashboard/hydration'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardHydration
      resources={['contracts', 'shares', 'provider-relations']}
    >
      {children}
    </DashboardHydration>
  )
}
