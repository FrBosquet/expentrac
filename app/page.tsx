import { Footer } from '@components/Footer'
import { Logo } from '@components/Logo'
import { NavMenu } from '@components/NavMenu'
import { Features } from '@components/hero/Features'
import { Resume } from '@components/hero/Resume'
import { StartNow } from '@components/hero/StartNow'
import { Wheel } from '@components/hero/Wheel'
import { HeaderSignin, RegularSignin } from '@components/hero/signin'

export default function Home() {
  return (
    <main className='relative h-screen bg-gradient-to-r from-slate-800 to-slate-500 overflow-x-hidden text-slate-200 perspective-container'>
      <div className='absolute top-1/2 left-1/4 text-slate-200 opacity-5 text-8xl -translate-y-[50%] scale-[200%] font-semibold blur-xs'>
        <p>Your finances</p>
        <p>under your control</p>
      </div>

      <Wheel />

      <section className="relative flex flex-col h-screen w-screen items-center ">
        <header className='flex w-full p-6 justify-between gap-4'>
          <Logo className="text-4xl">expentrac</Logo>
          <NavMenu className='flex-1' />
          <HeaderSignin />
        </header>

        <section className='flex-1 flex flex-col justify-center gap-6 max-w-screen-xl w-full items-start p-6'>
          <h1 className='text-slate-200 text-6xl sm:text-8xl leading-tight animate-fall'>Your finances <br /><span className='text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary font-semibold'>under your control</span></h1>

          <p className='text-slate-300 max-w-md'>Expentrac allows you to keep track of your loans and subscriptions your way: without external dependencies and providing just the information that you want. Easy. Simple.</p>
          <RegularSignin className='self-center' />
        </section>
      </section>

      <Resume />
      <Features />
      <StartNow />
      <Footer />
    </main>
  )
}
