import { type RawUser } from '@lib/prisma'
import { useSession } from 'next-auth/react'

export const useUser = () => {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const user = session?.user as RawUser

  // TODO: Remove this in favour of own resource
  const ownsAsset = (asset: { userId: string }) => {
    return user?.id === asset?.userId
  }

  const ownsResource = (asset: { userId: string }) => {
    return user?.id === asset?.userId
  }

  return {
    user,
    loading,
    ownsAsset,
    ownsResource,
    name: loading ? '...' : user?.name
  }
}
