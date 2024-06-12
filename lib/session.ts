import { type User } from '@lib/prisma'
import { type Session } from 'next-auth'

type SessionWithUser = Session & {
  user: User
}

export const hasUser = (data: Session | null): data is SessionWithUser => {
  if (!data) return false
  if (!data.user) return false

  return true
}

export const getUser = (data: Session | null): User => {
  if (!hasUser(data)) {
    return {
      id: '',
      name: null,
      email: null,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      occupation: null
    }
  }

  return data.user
}

export const getUserInitials = ({ name }: User): string => {
  return (
    name
      ?.split(' ')
      .map((n) => n.charAt(0))
      .join('') ?? ''
  )
}
