import { PrismaClient } from '@prisma/client'
export * from '@prisma/client'

// Evertyy type from prisma should be imported from here, agging a Raw prefix
export {
  type Account as RawAccount, type Contract as RawContract,
  type Loan as RawLoan, type Period as RawPeriod, type Provider as RawProvider, type ProvidersOnContract as RawProvidersOnContract,
  type Resource as RawResource,
  type Share as RawShare, type User as RawUser
} from '@prisma/client'

export const prisma = new PrismaClient()
