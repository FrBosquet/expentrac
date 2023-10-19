import { type RawUser } from '@lib/prisma'
import { useSession } from 'next-auth/react'

export const useUser = () => {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const user = session?.user as RawUser

  const ownsAsset = (asset: { userId: string }) => {
    return user?.id === asset?.userId
  }

  return { user, loading, ownsAsset, name: loading ? '...' : user?.name }
}
