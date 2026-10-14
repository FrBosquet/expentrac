import { type User } from '@lib/models'
import { type Session } from 'next-auth'

type SessionWithUser = Session & {
  user: User
}

export const hasUser = (data: Session | null): data is SessionWithUser => {
  if (!data) return false
  if (!data.user || typeof data.user.id !== 'string' || !data.user.id)
    return false

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

export const getUserInitials = ({ name }: Pick<User, 'name'>): string => {
  return (
    name
      ?.split(' ')
      .map((n) => n.charAt(0))
      .join('') ?? ''
  )
}
