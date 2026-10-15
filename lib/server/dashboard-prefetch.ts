import 'server-only'

import { dehydrate } from '@tanstack/react-query'
import { safeDto } from '@lib/dto'
import { createQueryClient, keys } from '@lib/query-policy'
import { requireUser } from './api'
import {
  readAll,
  readContracts,
  readShares,
  readNotifications,
  readProviderRelations,
  readProviders,
  readProfile
} from './reads'

const readers = {
  contracts: () => readAll(readContracts),
  shares: () => readAll(readShares),
  notifications: () => readAll(readNotifications),
  'provider-relations': () => readAll(readProviderRelations),
  providers: () => readAll(readProviders),
  profile: () => readProfile()
}
export type DashboardResource = keyof typeof readers

export async function prefetchDashboard(
  resources: readonly DashboardResource[]
) {
  const id = await requireUser()
  const client = createQueryClient()
  try {
    await Promise.all(
      resources.map((resource) =>
        client.prefetchQuery({
          queryKey: keys.resource(id, resource),
          queryFn: async () => safeDto(await readers[resource]())
        })
      )
    )
    // Failed prefetches are omitted; their client queries render the loading/error UX.
    return dehydrate(client)
  } finally {
    client.clear()
  }
}
