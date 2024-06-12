import { type Provider } from '@lib/prisma'
// TODO: This has to dissapear

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
  SVG = 'svg'
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

export type ProviderFetched = Required<Omit<Provider, 'isFetched'>> & {
  isFetched: true
}
export type ProviderUnfetched = { isFetched: false } & Pick<
  Provider,
  'id' | 'name'
>

export enum NOTIFICATION_TYPE {
  GENERIC = 'GENERIC',
  LOAN_SHARE = 'LOAN_SHARE',
  LOAN_SHARE_ACCEPTED = 'LOAN_SHARE_ACCEPTED',
  LOAN_SHARE_REJECTED = 'LOAN_SHARE_REJECTED',
  SUB_SHARE = 'SUB_SHARE',
  SUB_SHARE_ACCEPTED = 'SUB_SHARE_ACCEPTED',
  SUB_SHARE_REJECTED = 'SUB_SHARE_REJECTED',
  DAILY = 'DAILY'
}

export interface NotificationBase {
  type: NOTIFICATION_TYPE
  createdAt: Date
  ack: boolean
}

export enum SHARE_STATE {
  PENDING = 0,
  ACCEPTED = 1,
  REJECTED = 2
}

export enum SELECT_OPTIONS {
  NONE = 'NONE',
  CREATE = 'CREATE'
}

export enum TIME {
  PAST,
  PRESENT,
  FUTURE
}

export type ButtonVariant =
  | 'outline'
  | 'destructive'
  | 'link'
  | 'default'
  | 'secondary'
  | 'ghost'
  | null
  | undefined
