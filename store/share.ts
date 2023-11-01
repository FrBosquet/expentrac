import { type Share } from '@lib/prisma'
import { type StateCreator } from 'zustand'

export interface ShareSlice {
  shares: Share[]
  setShares: (shares: Share[]) => void
  updateShare: (loan: Share) => void
}

const sortFunction = (a: Share, b: Share) => {
  if (a.contract.periods.length === 0) return -1
  if (b.contract.periods.length === 0) return 1

  const aPeriod = a.contract.periods[0]
  const bPeriod = b.contract.periods[0]

  return aPeriod.from > bPeriod.from ? -1 : 1
}

export const createShareSlice: StateCreator<ShareSlice> = (set) => ({
  shares: [],
  setShares: (rawShares: Share[]) => {
    set({
      shares: rawShares.sort(sortFunction)
    })
  },
  updateShare: (loan: Share) => {
    set(state => ({
      shares: state.shares.map(l => l.id === loan.id ? loan : l)
    }))
  }
})

export const getSharesSetter = (state: ShareSlice) => state.setShares
export const getShareUpdater = (state: ShareSlice) => state.updateShare

export const getShares = (state: ShareSlice) => {
  const { shares } = state

  return shares
}

export const getShare = (id: string) => (state: ShareSlice) => {
  const { shares } = state

  const share = shares.find(share => share.id === id)

  if (!share) return null

  return share
}
