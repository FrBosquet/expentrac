import { type RawContract, type RawPeriod, type RawProvider, type RawProvidersOnContract, type RawResource, type RawShare, type RawUser } from '@lib/prisma'

export enum CONTRACT_TYPE {
  LOAN = 'LOAN',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export type Contract = RawContract & {
  periods: RawPeriod[]
  providers: Array<RawProvidersOnContract & { provider: RawProvider }>
  resources: RawResource[]
  shares: Array<RawShare & { to: RawUser, from: RawUser }>
}
