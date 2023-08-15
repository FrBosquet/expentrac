import { Provider } from "@prisma/client"
import { BrandExtendedInfo, ProviderFetched, ProviderUnfetched } from "@types"

export const isFetchedProvider = (provider: ProviderFetched | ProviderUnfetched): provider is ProviderFetched => {
  return provider.isFetched
}

export const getAccentColor = (provider?: Provider) => {
  if (!provider || !provider?.isFetched || !provider.rawContent) return ''

  const data = provider.rawContent as BrandExtendedInfo
  const colors = data.colors

  const accent = colors.find(color => color.type === 'accent')

  return accent?.hex
}
