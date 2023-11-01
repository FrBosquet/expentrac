'use client'

import { type Contract, type Notification, type ProviderOnContract, type Share } from '@lib/prisma'
import { useEffect } from 'react'
import { create } from 'zustand'
import { createContractsSlice, type ContractsSlice } from './contracts'
import { createDateSlice, type DateSlice } from './date'
import { createNotificationSlice, type NotificationSlice } from './notification'
import { createProvidersOnContractsSlice, type ProviderOnContractSlice } from './provider-on-contract'
import { createShareSlice, type ShareSlice } from './share'

type RootState = ShareSlice & ContractsSlice & DateSlice & NotificationSlice & ProviderOnContractSlice

export const useStore = create<RootState>((...a) => ({
  ...createShareSlice(...a),
  ...createContractsSlice(...a),
  ...createDateSlice(...a),
  ...createNotificationSlice(...a),
  ...createProvidersOnContractsSlice(...a)
}))

interface Props {
  children: React.ReactNode
  contracts: Contract[]
  notifications: Notification[]
  shares: Share[]
  providersOnContracts: ProviderOnContract[]
}

export const StoreProvider = ({ children, shares, contracts, notifications, providersOnContracts }: Props) => {
  const setShares = useStore(store => store.setShares)
  const setContracts = useStore(store => store.setContracts)
  const setNotifications = useStore(store => store.setNotifications)
  const setProvidersOnContracts = useStore(store => store.setProvidersOnContracts)

  useEffect(() => {
    setShares(shares)
    setContracts(contracts)
    setNotifications(notifications)
    setProvidersOnContracts(providersOnContracts)
  }, [])

  return children
}
