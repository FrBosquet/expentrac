'use client'

import { type User } from '@lib/prisma'
import { useSession } from 'next-auth/react'

interface Props {
  children: React.ReactNode
}

export const RootProvider = ({ children }: Props) => {
  return (
    children
  )
}

export const useUser = () => {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const user = session?.user as User

  const ownsAsset = (asset: { userId: string }) => {
    return user?.id === asset?.userId
  }

  return { user, loading, ownsAsset, name: loading ? '...' : user?.name }
}
