'use client'

import { type User } from '@lib/prisma'
import { SessionProvider, useSession } from 'next-auth/react'
import { TooltipProvider } from './ui/tooltip'

interface Props {
  children: React.ReactNode
}

export const RootProvider = ({ children }: Props) => {
  return (
    <SessionProvider>
      <TooltipProvider delayDuration={75}>
        {children}
      </TooltipProvider>
    </SessionProvider>
  )
}

export const useUser = () => {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const user = session?.user as User || { name: 'loading' }

  const ownsAsset = (asset: { userId: string }) => {
    return user?.id === asset?.userId
  }

  return { user, loading, ownsAsset }
}
