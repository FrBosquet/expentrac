import { Footer } from '@components/Footer'
import { Header } from '@components/web/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className='relative min-h-screen bg-gradient-to-r from-slate-800 to-slate-500 overflow-x-hidden text-slate-200 flex flex-col'>
      <Header key="header" />
      {children}
      <Footer />
    </main>
  )
}
