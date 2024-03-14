import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@lib/prisma'
import { type AuthOptions } from 'next-auth'
import { type Adapter } from 'next-auth/adapters'
import GoogleProvider from 'next-auth/providers/google'
import { emailSdk } from './email'

const adapter = PrismaAdapter(prisma) as Adapter

export const authOptions: AuthOptions = {
  adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
      }

      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: '/'
  },
  events: {
    async createUser(message) {
      if (message.user.email) {
        void emailSdk.sendWelcome(message.user.email, message.user.name!)
      }
    }
  }
}
