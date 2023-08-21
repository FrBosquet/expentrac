'use client'

import { UserProviderCard } from "./card"
import { useProviders } from "./context"

export const UserProviderSummary = () => {
  const { providers } = useProviders()

  return <section className="grid grid-cols-3 gap-4">
    {providers.map((userProvider) => {
      return <UserProviderCard key={userProvider.id} userProvider={userProvider} />
    })}
  </section>

}