import { Footer } from '@components/footer'
import { Header } from '@components/web/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-r from-slate-800 to-slate-500 text-slate-200">
      <Header key="header" />
      {children}
      <Footer />
    </main>
  )
}
