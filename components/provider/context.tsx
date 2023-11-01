import { useStore } from '@store'
import { getProvidersAndContracts } from '@store/provider-on-contract'

export const useProviders = () => {
  const providers = useStore(getProvidersAndContracts)

  return {
    providers
  }
}
