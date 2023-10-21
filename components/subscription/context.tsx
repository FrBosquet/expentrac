'use client'

import { CONTRACT_TYPE } from '@lib/contract'
import { useResourceContext } from '@lib/resourceContext'
import { unwrapSub, type Subscription } from '@lib/sub'
import { useStore } from '@store'
import { getSubs } from '@store/contracts'
import { type SubscriptionComplete } from '@types'
import { createContext, type Dispatch, type ReactNode, type SetStateAction } from 'react'

interface Props {
  children: ReactNode
  serverValue: SubscriptionComplete[]
}

const defaultContextValue = {
  subs: [],
  setSubs: () => null,
  addSub: () => null,
  removeSub: () => null,
  updateSub: () => null,
  hasSubs: false
}

export const SubContext = createContext<{
  subs: SubscriptionComplete[]
  setSubs: Dispatch<SetStateAction<SubscriptionComplete[]>>
  addSub: (sub: SubscriptionComplete) => void
  removeSub: (sub: SubscriptionComplete) => void
  updateSub: (sub: SubscriptionComplete) => void
  hasSubs: boolean
}>(defaultContextValue)

export const SubsProvider = ({ children, serverValue }: Props) => {
  const {
    resource: subs,
    setResource: setSubs,
    add: addSub,
    remove: removeSub,
    update: updateSub
  } = useResourceContext<SubscriptionComplete>(
    serverValue,
    (a, b) => a.name.localeCompare(b.name)
  )

  return (
    <SubContext.Provider value={{ subs, setSubs, addSub, removeSub, updateSub, hasSubs: subs.length > 0 }}>
      {children}
    </SubContext.Provider>
  )
}

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
