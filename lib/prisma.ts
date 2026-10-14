import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client'

export type * from './models'
export { Prisma } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as { expentracPrisma7?: PrismaClient }
const max = Number(process.env.DB_POOL_MAX ?? 3)
if (!Number.isInteger(max) || max < 1 || max > 20) throw new Error('DB_POOL_MAX must be 1–20')
const adapter = new PrismaPg({
  connectionString: process.env.POSTGRES_PRISMA_URL,
  max, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 10_000
})
export const prisma = globalForPrisma.expentracPrisma7 ?? new PrismaClient({ adapter })
if (process.env.NODE_ENV !== 'production') globalForPrisma.expentracPrisma7 = prisma
