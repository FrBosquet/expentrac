'use client'

import { AiOutlineGoogle } from '@components/Icons'
import { Button } from '@components/ui/button'
import { signIn } from 'next-auth/react'

const handleSignIn = () => {
  void signIn('google', { callbackUrl: '/dashboard' })
}

export const HeaderSignin = () => {
  return <Button onClick={handleSignIn} className='hidden sm:flex gap-4 text-slate-700 bg-primary-600 hover:bg-primary-800 hover:text-slate-100'><AiOutlineGoogle /> Sign in</Button>
}

export const RegularSignin = () => {
  return <Button onClick={handleSignIn} className='flex gap-4 bg-slate-200 text-slate-700 hover:bg-slate-300 self-center'>Sign up now</Button>
}
