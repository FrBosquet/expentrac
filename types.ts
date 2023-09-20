import { type Loan, type LoanShare, type Provider, type Subscription, type SubscriptionShare, type User, type UserProvider } from '@prisma/client'

export interface LoanExtendedInfo {
  totalAmount: number
  paidAmount: number
  owedAmount: number

  payments: number
  paymentsDone: number
  paymentsLeft: number

  vendor?: Provider
  platform?: Provider
  lender?: Provider

  isOver: boolean

  hasShares: boolean
  holderAmount: number
  holderFee: number
}

export interface BrandExtendedInfo {
  name: string
  domain: string
  claimed: boolean
  description: string
  links: Link[]
  logos: Logo[]
  colors: Color[]
  fonts: Font[]
  images: Image[]
}

export interface Color {
  hex: string
  type: string
  brightness: number
}

export interface Font {
  name: string
  type: string
  origin: string
  originId: null
  weights: any[]
}

export interface Image {
  formats: FormatElement[]
  tags: any[]
  type: string
}

export interface FormatElement {
  src: string
  background: null | string
  format: FormatEnum
  height?: number
  width?: number
  size: number
}

export enum FormatEnum {
  JPEG = 'jpeg',
  PNG = 'png',
  SVG = 'svg',
}

export interface Link {
  name: string
  url: string
}

export interface Logo {
  theme: string
  formats: FormatElement[]
  tags: any[]
  type: string
}

export type ProviderFetched = Required<Omit<Provider, 'isFetched'>> & { isFetched: true }
export type ProviderUnfetched = { isFetched: false } & Pick<Provider, 'id' | 'name'>

export type LoanComplete = Loan & {
  vendor?: UserProvider & { provider: Provider }
  platform?: UserProvider & { provider: Provider }
  lender?: UserProvider & { provider: Provider }
  shares: LoanShareComplete[]
  user: User
}

export type UserProviderComplete = UserProvider & {
  provider: Provider
}

export type SubscriptionComplete = Subscription & {
  vendor?: UserProvider & { provider: Provider }
  platform?: UserProvider & { provider: Provider }
  shares: SubscriptionShareComplete[]
  user: User
}

export type LoanShareComplete = LoanShare & {
  loan: LoanComplete
  user: User
}

export type SubscriptionShareComplete = SubscriptionShare & {
  subscription: SubscriptionComplete
  user: User
}
