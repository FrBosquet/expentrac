'use client'

import { type Contract, type Share } from '@lib/prisma'
import { useEffect } from 'react'
import { create } from 'zustand'
import { createLoanSlice, type LoanSlice } from './loan'
import { createShareSlice, type ShareSlice } from './share'

type RootState = LoanSlice & ShareSlice

export const useStore = create<RootState>((...a) => ({
  ...createLoanSlice(...a),
  ...createShareSlice(...a)
}))

export const StoreProvider = ({ children, serverLoans, serverShares }: { children: React.ReactNode, serverLoans: Contract[], serverShares: Share[] }) => {
  const setLoans = useStore(store => store.setLoans)
  const setShares = useStore(store => store.setShares)

  useEffect(() => {
    setLoans(serverLoans)
    setShares(serverShares)
  }, [])

  return children
}
