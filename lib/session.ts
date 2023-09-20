import { type User } from '@prisma/client'
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
      updatedAt: new Date()
    }
  }

  return data.user
}
