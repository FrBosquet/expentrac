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
} from '../generated/prisma/browser'
export type * from '../generated/prisma/browser'

export type RawAccount = PAccount
export type RawContract = PContract
export type RawLoan = PLoan
export type RawPeriod = PPeriod
export type RawProvider = PProvider
export type RawProvidersOnContract = PProvidersOnContract
export type RawResource = PResource
export type RawShare = PShare
export type RawUser = PUser
export type ProfileUser = Pick<
  PUser,
  'id' | 'name' | 'email' | 'image' | 'occupation'
>
export type PublicUser = Pick<PUser, 'id' | 'name' | 'image'> & {
  email?: string | null
}

export type Contract = RawContract & {
  periods: RawPeriod[]
  providers: Array<RawProvidersOnContract & { provider: Provider }>
  resources: RawResource[]
  shares: Array<RawShare & { to: PublicUser }>
  user: PublicUser
}

export type Share = RawShare & {
  to: PublicUser
  from: PublicUser
  contract: Contract | null
  preview: import('./dto').ContractPreview
}

export type ProviderOnContract = RawProvidersOnContract & {
  provider: Provider
}

export type Provider = RawProvider & {
  providersOnContracts?: ProviderOnContract[]
}
