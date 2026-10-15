import 'server-only'

import { prisma } from '@lib/prisma'
import { emailSdk } from '@lib/email'
import { type AdapterUser } from 'next-auth/adapters'

// An enqueue/render failure must not leave an unlinked new OAuth user behind.
export const createAuthUser = async (
  data: Omit<AdapterUser, 'id'>
): Promise<AdapterUser> =>
  prisma.$transaction(async (db) => {
    const user = await db.user.create({ data })
    await emailSdk.sendWelcome(
      data.email,
      user.name ?? 'there',
      db,
      `welcome/${user.id}`
    )
    return { ...user, email: data.email }
  })
