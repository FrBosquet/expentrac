import { FetchedProvider } from "@components/provider/FetchedProvider"
import { ProviderAdd } from "@components/provider/ProviderAdd"
import { UnfetchedProvider } from "@components/provider/UnfetchedProvider"
import { getUrl } from "@lib/api"
import { isFetchedProvider } from "@lib/provider"
import { getUser } from "@lib/session"
import { UserProvider } from "@prisma/client"
import { authOptions } from "@services/auth"
import { ProviderFetched, ProviderUnfetched } from "@types"
import { getServerSession } from "next-auth"

type SafeUserProvider = UserProvider & { provider: ProviderFetched | ProviderUnfetched }

const getUserProviders = async (userId: string) => {
  const url = getUrl(`user-provider?userId=${userId}`)

  const response = await fetch(url, { cache: 'no-store', credentials: 'include' })
  const providers = await response.json()

  return providers as SafeUserProvider[]
}

export default async function Page() {
  const data = await getServerSession(authOptions)

  const user = getUser(data)
  const userId = user.id as string

  const userProviders = await getUserProviders(userId)

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
            return <UnfetchedProvider key={provider.id} provider={provider} />
          }
        })}
      </section>
    </section>
  )
}