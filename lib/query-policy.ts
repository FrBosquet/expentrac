import { QueryClient } from '@tanstack/react-query'

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
