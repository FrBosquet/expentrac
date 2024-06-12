'use client'

import { AiOutlineGoogle } from '@components/Icons'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'
import { useUser } from '@components/user/hooks'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { twMerge } from 'tailwind-merge'

export const handleSignIn = () => {
  void signIn('google', { callbackUrl: '/dashboard' })
}

const useClickHandler = () => {
  const { user, loading } = useUser() // TODO: Get loading state from useUser and show a spinner in the buttons
  const router = useRouter()

  const handleClick = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      handleSignIn()
    }
  }

  return { handleClick, isLogged: !!user, user, loading }
}

interface Props {
  className?: string
}

export const SignInHeader = ({ className }: Props) => {
  const { handleClick, isLogged, user, loading } = useClickHandler()

  return (
    <Button
      className={twMerge('hidden sm:flex gap-4', className)}
      disabled={loading}
      variant="expentrac"
      onClick={handleClick}
    >
      {loading ? (
        <Spinner />
      ) : isLogged ? (
        `Hi ${user.name}`
      ) : (
        <>
          <AiOutlineGoogle />
          Sign in
        </>
      )}
    </Button>
  )
}

export const SignInRegular = ({ className }: Props) => {
  const { handleClick, isLogged, loading } = useClickHandler()

  return (
    <Button
      className={twMerge(
        'flex gap-4 bg-slate-200 text-slate-700 hover:bg-slate-300',
        className
      )}
      disabled={loading}
      onClick={handleClick}
    >
      {isLogged ? 'To your dashboard' : 'Sign up now'}
    </Button>
  )
}
