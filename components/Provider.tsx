'use client'

import { User } from '@prisma/client'
import { SessionProvider, useSession } from 'next-auth/react'

interface Props {
  children: React.ReactNode;
}

export const Provider = ({ children }: Props) => {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

export const useUser = () => {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const user = session?.user as User

  return { user, loading }
}