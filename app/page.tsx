'use client'

import { AiOutlineGoogle } from '@components/Icons'
import { Logo } from '@components/Logo'
import { Wheel } from '@components/hero/Wheel'
import { Button } from '@components/ui/button'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function Home() {
  const { data: session } = useSession()

  if (session) {
    redirect('/dashboard')
  }

  const handleSignIn = () => {
    void signIn('google')
  }

  return (
    <main className='relative h-screen bg-gradient-to-r from-slate-800 to-slate-500 overflow-x-hidden'>
      <div className='absolute top-1/2 left-1/4 text-slate-200 opacity-5 text-8xl -translate-y-[50%] scale-[200%] font-semibold blur-xs'>
        <p>Your finances</p>
        <p>under your control</p>
      </div>

      <Wheel />

      <section className="absolute flex flex-col h-screen w-screen items-center ">
        <header className='flex w-full p-6 justify-between gap-4'>
          <Logo className="text-4xl">expentrac</Logo>
          <menu className='gap-4 flex-1 hidden sm:flex'>
            <Link href='/blog' className='uppercase text-slate-400 hover:text-slate-200 transition'>Blog</Link>
            <Link href='/pricing' className='uppercase text-slate-400 hover:text-slate-200 transition'>Pricing</Link>
            <Link href='/team' className='uppercase text-slate-400 hover:text-slate-200 transition'>Team</Link>
          </menu>
          <Button onClick={handleSignIn} className='hidden sm:flex gap-4 text-slate-700 bg-primary-600 hover:bg-primary-800 hover:text-slate-100'><AiOutlineGoogle /> Sign in</Button>
        </header>

        <section className='flex-1 flex flex-col justify-center gap-6 max-w-screen-xl w-full items-start p-6'>
          <h1 className='text-slate-200 text-6xl sm:text-8xl leading-tight'>Your finances <br /><span className='text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary font-semibold'>under your control</span></h1>

          <p className='text-slate-300 max-w-md'>Expentrac allows you to keep track of your loans and subscriptions your way: without external dependencies and providing just the information that you want. Easy. Simple.</p>
          <Button onClick={handleSignIn} className='flex gap-4 bg-slate-200 text-slate-700 hover:bg-slate-300 self-center'>Sign up now</Button>
        </section>
      </section>
    </main>
  )
}
