'use client'

import { type RawLoan } from '@types'
import { useEffect } from 'react'
import { create } from 'zustand'
import { createLoanSlice, type LoanSlice } from './loan'

type RootState = LoanSlice

export const useStore = create<RootState>((...a) => ({
  ...createLoanSlice(...a)
}))

export const StoreProvider = ({ children, serverLoans }: { children: React.ReactNode, serverLoans: RawLoan[] }) => {
  const setLoans = useStore(store => store.setLoans)

  useEffect(() => {
    setLoans(serverLoans)
  }, [])

  return children
}
