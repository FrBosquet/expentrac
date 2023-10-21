'use client'

import { type Contract, type Share } from '@lib/prisma'
import { useEffect } from 'react'
import { create } from 'zustand'
import { createContractsSlice, type ContractsSlice } from './contracts'
import { type DateSlice, createDateSlice } from './date'
import { createShareSlice, type ShareSlice } from './share'

type RootState = ShareSlice & ContractsSlice & DateSlice

export const useStore = create<RootState>((...a) => ({
  ...createShareSlice(...a),
  ...createContractsSlice(...a),
  ...createDateSlice(...a)
}))

interface Props {
  children: React.ReactNode
  contracts: Contract[]
  shares: Share[]
}

export const StoreProvider = ({ children, shares, contracts }: Props) => {
  const setShares = useStore(store => store.setShares)
  const setContracts = useStore(store => store.setContracts)

  useEffect(() => {
    setShares(shares)
    setContracts(contracts)
  }, [])

  return children
}
