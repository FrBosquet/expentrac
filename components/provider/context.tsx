'use client'
import { useProviderRelations } from '@hooks/resources'
import { type Provider } from '@lib/models'
export const useProviders = () => {
  const query = useProviderRelations()
  const providers: Provider[] = Array.from(
    new Map(
      query.relations.map((relation) => [
        relation.providerId,
        relation.provider
      ])
    ).values()
  ).map((provider) => ({
    ...provider,
    providersOnContracts: query.relations.filter(
      (relation) => relation.providerId === provider.id
    )
  }))
  return { ...query, providers }
}
