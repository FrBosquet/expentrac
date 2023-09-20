'use client'

import { AiOutlineGoogle } from '@components/Icons'
import { useUser } from '@components/Provider'
import { Button } from '@components/ui/button'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

export const handleSignIn = () => {
  void signIn('google', { callbackUrl: '/dashboard' })
}

const useClickHandler = () => {
  const { user } = useUser() // TODO: Get loading state from useUser and show a spinner in the buttons
  const router = useRouter()

  const handleClick = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      handleSignIn()
    }
  }

  return { handleClick, isLogged: !!user, user }
}

interface Props {
  className?: string
}

export const SignInHeader = ({ className }: Props) => {
  const { handleClick, isLogged, user } = useClickHandler()

  return <Button onClick={handleClick} className={twMerge('hidden sm:flex gap-4 text-slate-800 bg-primary-600 hover:bg-primary-300', className)}>
    {isLogged
      ? `Hi ${user.name}`
      : <>
        <AiOutlineGoogle />Sign in
      </>}
  </Button>
}

export const SignInRegular = ({ className }: Props) => {
  const { handleClick, isLogged } = useClickHandler()

  return <Button onClick={handleClick} className={twMerge('flex gap-4 bg-slate-200 text-slate-700 hover:bg-slate-300', className)}>
    {
      isLogged
        ? 'To your dashboard'
        : 'Sign up now'
    }
  </Button>
}
