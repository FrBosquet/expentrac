'use client'

import { CONTRACT_TYPE } from '@lib/contract'
import { unwrapSub, type Subscription } from '@lib/sub'
import { useStore } from '@store'
import { getSub, getSubs } from '@store/contracts'

export const useSubs = () => {
  const subs = useStore(getSubs)
  const addSub = useStore((state) => state.addContract)
  const removeSub = useStore((state) => state.removeContract)
  const updateSub = useStore((state) => state.updateContract)
  const shares = useStore(state => state.shares)

  // TODO: Move to a selector in shares store
  const sharedSubs = shares.filter(share => {
    return share.accepted && share.contract.type === CONTRACT_TYPE.SUBSCRIPTION
  }).map(share => unwrapSub(share.contract))

  const allSubs = [...subs, ...sharedSubs] as Subscription[]

  const hasOwnSubs = subs.length > 0
  const hasSharedSubs = sharedSubs.length > 0
  const hasAnySubs = hasOwnSubs || hasSharedSubs

  return {
    subs,
    addSub,
    removeSub,
    updateSub,
    allSubs,
    hasOwnSubs,
    hasSharedSubs,
    hasAnySubs
  }
}

export const useSub = (id: string) => {
  const shares = useStore(state => state.shares)

  let sub = useStore(getSub(id))

  if (!sub) {
    const share = shares.find(share => share.contract.id === id)

    if (share) {
      sub = unwrapSub(share.contract)
    }
  }

  return {
    sub
  }
}
