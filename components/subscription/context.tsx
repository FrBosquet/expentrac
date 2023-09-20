'use client'

import { useSubShares } from '@components/subscription-share/Context'
import { useResourceContext } from '@lib/resourceContext'
import { type SubscriptionComplete } from '@types'
import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from 'react'

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
  const context = useContext(SubContext)
  if (context === undefined) {
    throw new Error('useSubs must be used within a Provider')
  }

  const { subShares } = useSubShares()

  const sharedShares = subShares.filter(share => share.accepted).map((share) => share.subscription)
  const allSubs = [...context.subs, ...sharedShares]

  const hasOwnSubs = context.subs.length > 0
  const hasSharedSubs = sharedShares.length > 0
  const hasAnySubs = hasOwnSubs || hasSharedSubs

  return {
    ...context,
    allSubs,
    hasOwnSubs,
    hasSharedSubs,
    hasAnySubs
  }
}
