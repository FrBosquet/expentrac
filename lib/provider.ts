import { ProviderFetched, ProviderUnfetched } from "@types"

export const isFetchedProvider = (provider: ProviderFetched | ProviderUnfetched): provider is ProviderFetched => {
  return provider.isFetched
}