import { QueryClient, type DehydratedState } from '@tanstack/react-query'

export const keys = {
  scope: (id: string) => ['private', id] as const,
  resource: (id: string, name: string) => ['private', id, name] as const,
  search: (id: string, resource: string, term: string) =>
    ['private', id, resource, term] as const
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: (count, error) =>
          count < 2 &&
          (!('status' in error) ||
            Number(error.status) === 0 ||
            Number(error.status) >= 500)
      },
      mutations: { retry: false }
    }
  })
}

export async function invalidateResources(
  client: QueryClient,
  id: string,
  resources: readonly string[]
) {
  await Promise.all(
    resources.map((resource) =>
      client.invalidateQueries({ queryKey: keys.resource(id, resource) })
    )
  )
}

// A persistent server layout may belong to the previous account after a session change.
export function privateHydrationState(
  state: DehydratedState,
  id: string
): DehydratedState {
  return {
    mutations: [],
    queries: state.queries.filter(
      (query) => query.queryKey[0] === 'private' && query.queryKey[1] === id
    )
  }
}

let browserSessionClient: { id: string; client: QueryClient } | undefined

export function clearSessionQueryClient() {
  if (!browserSessionClient) return
  void browserSessionClient.client.cancelQueries()
  browserSessionClient.client.clear()
  browserSessionClient = undefined
}

// React may discard state when an initial streamed render suspends. Keep the browser
// client stable for the session; server renders always receive an independent client.
export function getSessionQueryClient(id: string) {
  if (typeof window === 'undefined') return createQueryClient()
  if (browserSessionClient?.id !== id) {
    clearSessionQueryClient()
    browserSessionClient = { id, client: createQueryClient() }
  }
  return browserSessionClient!.client
}
