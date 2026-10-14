'use client'

import { useDate } from '@components/date/context'
import { useContracts, useShareQuery } from '@hooks/resources'
import { CONTRACT_TYPE } from '@lib/contract'
import { unwrapSub } from '@lib/sub'

export const useSubs = () => {
  const { date } = useDate()
  const query = useContracts()
  const shares = useShareQuery()
  const subs = query.contracts
    .filter((c) => c.type === CONTRACT_TYPE.SUBSCRIPTION)
    .map((c) => unwrapSub(c, date))
  const sharedSubs = shares.shares
    .filter(
      (s) =>
        s.accepted === true && s.contract.type === CONTRACT_TYPE.SUBSCRIPTION
    )
    .map((s) => unwrapSub(s.contract, date))
  const allSubs = [...subs, ...sharedSubs]
  return {
    subs,
    allSubs,
    activeSubs: allSubs.filter((s) => s.periods.isActive),
    pausedSubs: allSubs.filter((s) => s.periods.isInactive),
    hasOwnSubs: subs.length > 0,
    hasSharedSubs: sharedSubs.length > 0,
    hasAnySubs: allSubs.length > 0,
    isLoading: query.isPending || shares.isPending,
    error: query.error ?? shares.error
  }
}
export const useSub = (id: string) => {
  const { date } = useDate()
  const query = useContracts()
  const shares = useShareQuery()
  const contract =
    query.contracts.find(
      (c) => c.id === id && c.type === CONTRACT_TYPE.SUBSCRIPTION
    ) ??
    shares.shares.find((s) => s.accepted === true && s.contractId === id)
      ?.contract
  return {
    sub: contract ? unwrapSub(contract, date) : null,
    isLoading: query.isPending || shares.isPending,
    error: query.error ?? shares.error
  }
}
