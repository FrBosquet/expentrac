import { Footer } from '@components/footer'
import { Features } from '@components/hero/Features'
import { Resume } from '@components/hero/Resume'
import { SignInRegular } from '@components/hero/signin'
import { StartNow } from '@components/hero/StartNow'
import { Wheel } from '@components/hero/Wheel'
import { Header } from '@components/web/Header'

// TODO: If we put this page in the (web) group, the layout breaks, so for now we need to stick to leave it here and try to re work i in the future
export default function Home() {
  return (
    <main className="dark relative h-screen overflow-x-hidden bg-gradient-to-r from-slate-800 to-slate-500 text-slate-200 perspective-container">
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 scale-[200%] text-8xl font-semibold text-slate-200 opacity-5 blur-xs">
        <p>Your finances</p>
        <p>under your control</p>
      </div>

      <Wheel />

      <section className="relative flex h-screen w-screen flex-col items-center ">
        <Header key="header" />

        <section className="flex w-full max-w-screen-xl flex-1 flex-col items-start justify-center gap-6 p-6">
          <h1 className="animate-fall text-6xl leading-tight text-slate-200 sm:text-8xl">
            Your finances <br />
            <span className="bg-gradient-to-r from-theme to-theme-accent bg-clip-text font-semibold text-transparent">
              under your control
            </span>
          </h1>

          <p className="max-w-md text-slate-400">
            Expentrac allows you to keep track of your loans and subscriptions
            your way: without external dependencies and providing just the
            information that you want. Easy. Simple.
          </p>
          <SignInRegular className="self-center" />
        </section>
      </section>

      <Resume />
      <Features />
      <StartNow />
      <Footer />
    </main>
  )
}
