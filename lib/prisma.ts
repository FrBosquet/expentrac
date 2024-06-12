import { PrismaClient } from '@prisma/client'
import {
  type Account as PAccount,
  type Contract as PContract,
  type Loan as PLoan,
  type Period as PPeriod,
  type Provider as PProvider,
  type ProvidersOnContract as PProvidersOnContract,
  type Resource as PResource,
  type Share as PShare,
  type User as PUser
} from '@prisma/client'
export * from '@prisma/client'

export type RawAccount = PAccount
export type RawContract = PContract
export type RawLoan = PLoan
export type RawPeriod = PPeriod
export type RawProvider = PProvider
export type RawProvidersOnContract = PProvidersOnContract
export type RawResource = PResource
export type RawShare = PShare
export type RawUser = PUser

export type Contract = RawContract & {
  periods: RawPeriod[]
  providers: ProviderOnContract[]
  resources: RawResource[]
  shares: Array<RawShare & { to: RawUser; from: RawUser; contract: Contract }>
  user: RawUser
}

export type Share = RawShare & {
  to: RawUser
  from: RawUser
  contract: Contract
}

export type ProviderOnContract = RawProvidersOnContract & {
  provider: Provider
  contract: Contract
}

export type Provider = RawProvider & {
  providersOnContracts: ProviderOnContract[]
}

export const prisma = new PrismaClient()
