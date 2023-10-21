'use client'

import { useStore } from '@store'
import { getShares } from '@store/share'

export const useLoanShares = () => {
  const shares = useStore(getShares)

  return {
    shares
  }
}
