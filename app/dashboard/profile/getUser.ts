import { authOptions } from '@lib/auth'
import { prisma } from '@lib/prisma'
import { hasUser } from '@lib/session'
import { type User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

export const getUserData = async (): Promise<User> => {
  const data = await getServerSession(authOptions)

  if (!hasUser(data)) redirect('/')

  const user = await prisma.user.findUnique({
    where: {
      id: data.user.id
    }
  })

  if (!user) redirect('/')

  return user
}
