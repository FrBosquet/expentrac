import { Logo } from '@components/Logo'
import { Features } from '@components/hero/Features'
import { Resume } from '@components/hero/Resume'
import { Wheel } from '@components/hero/Wheel'
import { HeaderSignin, RegularSignin } from '@components/hero/signin'
import Link from 'next/link'

export default function Home() {
  return (
    <main className='relative h-screen bg-gradient-to-r from-slate-800 to-slate-500 overflow-x-hidden text-slate-200'>
      <div className='absolute top-1/2 left-1/4 text-slate-200 opacity-5 text-8xl -translate-y-[50%] scale-[200%] font-semibold blur-xs'>
        <p>Your finances</p>
        <p>under your control</p>
      </div>

      <Wheel />

      <section className="relative flex flex-col h-screen w-screen items-center ">
        <header className='flex w-full p-6 justify-between gap-4'>
          <Logo className="text-4xl">expentrac</Logo>
          <menu className='gap-4 flex-1 hidden sm:flex'>
            <Link href='/blog' className='uppercase text-slate-400 hover:text-slate-200 transition'>Blog</Link>
            <Link href='/pricing' className='uppercase text-slate-400 hover:text-slate-200 transition'>Pricing</Link>
            <Link href='/team' className='uppercase text-slate-400 hover:text-slate-200 transition'>Team</Link>
          </menu>
          <HeaderSignin />
        </header>

        <section className='flex-1 flex flex-col justify-center gap-6 max-w-screen-xl w-full items-start p-6'>
          <h1 className='text-slate-200 text-6xl sm:text-8xl leading-tight'>Your finances <br /><span className='text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary font-semibold'>under your control</span></h1>

          <p className='text-slate-300 max-w-md'>Expentrac allows you to keep track of your loans and subscriptions your way: without external dependencies and providing just the information that you want. Easy. Simple.</p>
          <RegularSignin />
        </section>
      </section>

      <Resume />
      <Features />
    </main>
  )
}
