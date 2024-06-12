import { Footer } from '@components/footer'

import { Header } from './Header'

export const WebLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-r from-slate-800 to-slate-500 text-slate-200">
      <Header key="weblayout" />
      <section className="relative m-auto w-full max-w-6xl flex-1 p-6">
        {children}
      </section>
      <Footer />
    </main>
  )
}
