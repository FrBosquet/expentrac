import { type Contract, type Provider, type ProviderOnContract } from '@lib/prisma'
import { type StateCreator } from 'zustand'

export interface ProviderOnContractSlice {
  providersOnContracts: ProviderOnContract[]
  setProvidersOnContracts: (contracts: ProviderOnContract[]) => void
}

const sortFunction = (a: ProviderOnContract, b: ProviderOnContract) => {
  return a.provider.name > b.provider.name ? 1 : -1
}

export const createProvidersOnContractsSlice: StateCreator<ProviderOnContractSlice> = (set) => ({
  providersOnContracts: [],
  setProvidersOnContracts: (rawPOC: ProviderOnContract[]) => {
    set({
      providersOnContracts: rawPOC.sort(sortFunction)
    })
  }
})

export const getProvidersOnContractsSetter = (state: ProviderOnContractSlice) => state.setProvidersOnContracts

export const getProvidersOnContracts = (state: ProviderOnContractSlice) => {
  return state.providersOnContracts
}

export const getProvidersAndContracts = (state: ProviderOnContractSlice) => {
  return state.providersOnContracts.reduce<Array<Provider & {
    as: {
      lender: Contract[]
      vendor: Contract[]
      platform: Contract[]
    }
  }>>((acc, { contract, provider, as }) => {
    const providerAndContracts = acc.find(p => p.id === provider.id)

    const lender = as === 'LENDER' ? [contract] : []
    const vendor = as === 'VENDOR' ? [contract] : []
    const platform = as === 'PLATFORM' ? [contract] : []

    if (!providerAndContracts) {
      acc.push({
        ...provider,
        as: {
          lender,
          vendor,
          platform
        }
      })
    } else {
      providerAndContracts.as.lender.push(...lender)
      providerAndContracts.as.vendor.push(...vendor)
      providerAndContracts.as.platform.push(...platform)
    }

    return acc
  }, [])
}

export type ProviderWithContracts = ReturnType<typeof getProvidersAndContracts>[number]
