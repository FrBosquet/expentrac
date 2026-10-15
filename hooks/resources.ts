'use client'

import {
  pauseSubscription,
  resumeSubscription,
  updateSubscriptionPrice
} from '@components/subscription/actions'
import { type LoanFormData } from '@lib/loan'
import { type SubFormData } from '@lib/sub'
import { contractSdk } from '@sdk/contract'
import { profileSdk } from '@sdk/profile'
import { workContractSdk } from '@sdk/work-contract'
import { keys, invalidateResources } from '@lib/query-policy'
import { loanSdk } from '@sdk/loan'
import { notificationSdk } from '@sdk/notifications'
import { providerSdk } from '@sdk/provider'
import { providerOnContractSdk } from '@sdk/provider-on-contract'
import { shareSdk } from '@sdk/share'
import { subscriptionSdk } from '@sdk/subscription'
import { useQueryScope } from '@store'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult
} from '@tanstack/react-query'
import { type SHARE_STATE } from '@types'
import { toast } from 'sonner'

const empty: never[] = []
function queryState<T>(query: UseQueryResult<T>) {
  return {
    data: query.data,
    isPending: query.isPending,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error,
    refetch: query.refetch
  }
}
export { keys } from '@lib/query-policy'
export const contractOptions = (id: string) =>
  queryOptions({
    queryKey: keys.resource(id, 'contracts'),
    queryFn: ({ signal }) => contractSdk.get(undefined, signal),
    enabled: !!id
  })
export function useContracts() {
  const query = useQuery(contractOptions(useQueryScope()))
  return { ...queryState(query), contracts: query.data ?? empty }
}
export function useShareQuery() {
  const id = useQueryScope()
  const query = useQuery({
    queryKey: keys.resource(id, 'shares'),
    queryFn: ({ signal }) => shareSdk.get(undefined, signal),
    enabled: !!id
  })
  return { ...queryState(query), shares: query.data ?? empty }
}
export function useNotificationQuery() {
  const id = useQueryScope()
  const query = useQuery({
    queryKey: keys.resource(id, 'notifications'),
    staleTime: 20_000,
    queryFn: ({ signal }) => notificationSdk.get(undefined, signal),
    enabled: !!id
  })
  return { ...queryState(query), notifications: query.data ?? empty }
}
export function useProviderRelations() {
  const id = useQueryScope()
  const query = useQuery({
    queryKey: keys.resource(id, 'provider-relations'),
    queryFn: ({ signal }) => providerOnContractSdk.get(undefined, signal),
    enabled: !!id
  })
  return { ...queryState(query), relations: query.data ?? empty }
}
export function useProfile() {
  const id = useQueryScope()
  return useQuery({
    queryKey: keys.resource(id, 'profile'),
    staleTime: 5 * 60_000,
    queryFn: ({ signal }) => profileSdk.get(signal),
    enabled: !!id
  })
}
export function useProviderCatalog() {
  const id = useQueryScope()
  const query = useQuery({
    queryKey: keys.resource(id, 'providers'),
    staleTime: 5 * 60_000,
    queryFn: ({ signal }) => providerSdk.get(signal),
    enabled: !!id
  })
  return { ...queryState(query), providers: query.data ?? empty }
}
const contractResources = [
  'contracts',
  'shares',
  'provider-relations',
  'notifications'
] as const
function useWrite<T, V>(
  operation: (value: V) => Promise<T>,
  resources: readonly string[] = contractResources
) {
  const id = useQueryScope()
  const client = useQueryClient()
  return useMutation({
    mutationFn: operation,
    onError: (error) => toast.error(error.message),
    onSuccess: async () => {
      await invalidateResources(client, id, resources)
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
    create,
    update,
    remove
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
    create,
    update,
    remove,
    pause,
    resume,
    price
  }
}
export function useShareWrite() {
  return useWrite(({ id, accepted }: { id: string; accepted: boolean }) =>
    shareSdk.update(id, accepted)
  )
}
export function useAckWrite() {
  return useWrite(
    ({ id, state }: { id: string; state?: SHARE_STATE }) =>
      notificationSdk.ack(id, state),
    ['notifications']
  )
}
export const useProviderWrite = () => useWrite(providerSdk.add, ['providers'])
export const useProfileWrite = () => useWrite(profileSdk.update, ['profile'])
export const useWorkWrite = () =>
  useWrite(workContractSdk.create, contractResources)
