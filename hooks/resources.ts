'use client'

import {
  pauseSubscription,
  resumeSubscription,
  updateSubscriptionPrice
} from '@components/subscription/actions'
import { type LoanFormData } from '@lib/loan'
import { type Contract } from '@lib/models'
import { type SubFormData } from '@lib/sub'
import { contractSdk } from '@sdk/contract'
import { contract, provider, user } from '@sdk/decode'
import { allPages, envelope, request } from '@sdk/http'
import { loanSdk } from '@sdk/loan'
import { notificationSdk } from '@sdk/notifications'
import { providerSdk } from '@sdk/provider'
import { providerOnContractSdk } from '@sdk/provider-on-contract'
import { shareSdk } from '@sdk/share'
import { subscriptionSdk } from '@sdk/subscription'
import { useQueryScope } from '@store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type SHARE_STATE } from '@types'
import { useCallback } from 'react'
import { toast } from 'sonner'

const empty: never[] = []
export const keys = {
  scope: (id: string) => ['private', id] as const,
  resource: (id: string, name: string) => ['private', id, name] as const
}
export function useContracts() {
  const id = useQueryScope()
  const query = useQuery({
    queryKey: keys.resource(id, 'contracts'),
    queryFn: ({ signal }) => contractSdk.get(id, signal),
    enabled: !!id
  })
  return { ...query, contracts: query.data ?? empty }
}
export function useShareQuery() {
  const id = useQueryScope()
  const query = useQuery({
    queryKey: keys.resource(id, 'shares'),
    queryFn: ({ signal }) => shareSdk.get(id, signal),
    enabled: !!id
  })
  return { ...query, shares: query.data ?? empty }
}
export function useNotificationQuery() {
  const id = useQueryScope()
  const query = useQuery({
    queryKey: keys.resource(id, 'notifications'),
    queryFn: ({ signal }) => notificationSdk.get(id, signal),
    enabled: !!id
  })
  return { ...query, notifications: query.data ?? empty }
}
export function useProviderRelations() {
  const id = useQueryScope()
  const query = useQuery({
    queryKey: keys.resource(id, 'provider-relations'),
    queryFn: ({ signal }) => providerOnContractSdk.get(id, signal),
    enabled: !!id
  })
  return { ...query, relations: query.data ?? empty }
}
export function useProfile() {
  const id = useQueryScope()
  return useQuery({
    queryKey: keys.resource(id, 'profile'),
    queryFn: ({ signal }) =>
      request(`profile?userId=${encodeURIComponent(id)}`, { signal }, user),
    enabled: !!id
  })
}
export function useProviderCatalog() {
  const id = useQueryScope()
  const query = useQuery({
    queryKey: keys.resource(id, 'providers'),
    queryFn: ({ signal }) =>
      allPages(`provider?userId=${encodeURIComponent(id)}`, provider, signal),
    enabled: !!id
  })
  return { ...query, providers: query.data ?? empty }
}
function useWrite<T, V>(operation: (value: V) => Promise<T>) {
  const id = useQueryScope()
  const client = useQueryClient()
  return useMutation({
    mutationFn: operation,
    onError: (error) => toast.error(error.message),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: keys.scope(id) })
    }
  })
}
export function useLoanWrites() {
  const create = useWrite(loanSdk.create)
  const update = useWrite(({ id, body }: { id: string; body: LoanFormData }) =>
    loanSdk.update(id, body)
  )
  const remove = useWrite(loanSdk.delete)
  return {
    create: create.mutateAsync,
    update: (id: string, body: LoanFormData) =>
      update.mutateAsync({ id, body }),
    remove: remove.mutateAsync
  }
}
export function useSubscriptionWrites() {
  const create = useWrite(subscriptionSdk.create)
  const update = useWrite(({ id, body }: { id: string; body: SubFormData }) =>
    subscriptionSdk.update(id, body)
  )
  const remove = useWrite(subscriptionSdk.delete)
  const pause = useWrite(pauseSubscription)
  const resume = useWrite(resumeSubscription)
  const price = useWrite(updateSubscriptionPrice)
  return {
    create: create.mutateAsync,
    update: (id: string, body: SubFormData) => update.mutateAsync({ id, body }),
    remove: remove.mutateAsync,
    pause: pause.mutateAsync,
    resume: resume.mutateAsync,
    price: price.mutateAsync
  }
}
export function useShareWrite() {
  const { mutateAsync } = useWrite(
    ({ id, accepted }: { id: string; accepted: boolean }) =>
      shareSdk.update(id, accepted)
  )
  return useCallback(
    (id: string, accepted: boolean) => mutateAsync({ id, accepted }),
    [mutateAsync]
  )
}
export function useAckWrite() {
  const { mutateAsync } = useWrite(
    ({ id, state }: { id: string; state?: SHARE_STATE }) =>
      notificationSdk.ack(id, state)
  )
  return useCallback(
    (id: string, state?: SHARE_STATE) => mutateAsync({ id, state }),
    [mutateAsync]
  )
}
export const useProviderWrite = () => useWrite(providerSdk.add)
export const useProfileWrite = () =>
  useWrite((body: { name: string; occupation: string }) =>
    request(
      'profile',
      { method: 'PATCH', body: JSON.stringify(body) },
      envelope(user)
    )
  )
export const useWorkWrite = () =>
  useWrite((body: Record<string, FormDataEntryValue>) =>
    request(
      'work-contract',
      { method: 'POST', body: JSON.stringify(body) },
      envelope(contract)
    )
  )
