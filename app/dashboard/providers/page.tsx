'use client'

import { ProviderAdd } from "@components/provider/Add"
import { useProviders } from "@components/provider/Context"
import { FetchedProvider } from "@components/provider/FetchedProvider"
import { UnfetchedProvider } from "@components/provider/UnfetchedProvider"
import { isFetchedProvider } from "@lib/provider"
import { ProviderUnfetched } from "@types"

export default function Page() {
  const { providers: userProviders } = useProviders()

  return (
    <section className="flex-1 w-screen max-w-3xl p-12 m-auto flex flex-col gap-4">
      <h1 className="text-3xl">Your providers</h1>
      <p className="text-slate-500">The companies and services that you use to buy, to pay or to get money from.</p>
      <div className="flex flex-col gap-2 justify-end">
        <ProviderAdd />
      </div>
      <section className="grid grid-cols-3 gap-4">
        {userProviders.map(({ provider }) => {
          if (isFetchedProvider(provider)) {
            return <FetchedProvider key={provider.id} provider={provider} />
          } else {
            return <UnfetchedProvider key={provider.id} provider={provider as ProviderUnfetched} />
          }
        })}
      </section>
    </section>
  )
}