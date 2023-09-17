import { Footer } from '@components/Footer'
import { Header } from './Header'

export const WebLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className='relative min-h-screen bg-gradient-to-r from-slate-800 to-slate-500 overflow-x-hidden text-slate-200 flex flex-col'>
      <Header />
      <section className='w-full m-auto max-w-6xl p-6 flex-1'>
        {children}
      </section>
      <Footer />
    </main>
  )
}
