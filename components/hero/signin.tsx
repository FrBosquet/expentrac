'use client'

import { AiOutlineGoogle } from '@components/Icons'
import { Button } from '@components/ui/button'
import { signIn } from 'next-auth/react'
import { twMerge } from 'tailwind-merge'

const handleSignIn = () => {
  void signIn('google', { callbackUrl: '/dashboard' })
}

interface Props {
  className?: string
}

export const HeaderSignin = ({ className }: Props) => {
  return <Button onClick={handleSignIn} className={twMerge('hidden sm:flex gap-4 text-slate-700 bg-primary-600 hover:bg-primary-800 hover:text-slate-100', className)}><AiOutlineGoogle /> Sign in</Button>
}

export const RegularSignin = ({ className }: Props) => {
  return <Button onClick={handleSignIn} className={twMerge('flex gap-4 bg-slate-200 text-slate-700 hover:bg-slate-300', className)}>Sign up now</Button>
}
