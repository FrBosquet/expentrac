import { User } from "@prisma/client"
import { Session } from "next-auth"

type SessionWithUser = Session & {
  user: User
}

export const hasUser = (data: Session | null): data is SessionWithUser => {
  if (!data) return false
  if (!data.user) return false

  return true
}