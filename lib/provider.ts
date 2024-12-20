import { type Provider } from '@lib/prisma'
import {
  type BrandExtendedInfo,
  type ProviderFetched,
  type ProviderUnfetched
} from '@types'

export enum PROVIDER_TYPE {
  VENDOR = 'VENDOR',
  PLATFORM = 'PLATFORM',
  LENDER = 'LENDER',
  EMPLOYER = 'EMPLOYER'
}

export const isFetchedProvider = (
  provider: ProviderFetched | ProviderUnfetched
): provider is ProviderFetched => {
  return provider.isFetched
}

export const getAccentColor = (provider?: Provider) => {
  if (!provider || !provider?.isFetched || !provider.rawContent) return ''

  const data = provider.rawContent as unknown as BrandExtendedInfo
  const colors = data.colors

  const accent = colors.find((color) => color.type === 'accent')

  return accent?.hex
}

export const getProviderLink = (provider?: Provider) => {
  if (!provider || !provider?.isFetched || !provider.rawContent) return ''

  const data = provider.rawContent as unknown as BrandExtendedInfo

  return `https://${data.domain}`
}
