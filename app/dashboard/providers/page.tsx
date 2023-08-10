import { ProviderAdd } from "@components/provider/ProviderAdd"
import { getUrl } from "@lib/api"
import { getUser } from "@lib/session"
import { Provider, UserProvider } from "@prisma/client"
import { authOptions } from "@services/auth"
import { HelpCircle } from "lucide-react"
import { getServerSession } from "next-auth"

type UnfetchedProvider = { isFetched: false } & Pick<Provider, 'id' | 'name'>
type FetchedProvider = Required<Omit<Provider, 'isFetched'>> & { isFetched: true }
type SafeProvider = FetchedProvider | UnfetchedProvider
type SafeUserProvider = UserProvider & { provider: SafeProvider }

const getUserProviders = async (userId: string) => {
  const url = getUrl(`user-provider?userId=${userId}`)

  const response = await fetch(url, { cache: 'no-store', credentials: 'include' })
  const providers = await response.json()

  return providers as SafeUserProvider[]
}

const isFetchedProvider = (provider: SafeProvider): provider is FetchedProvider => {
  return provider.isFetched
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
            return <article><h3 className="text-md">{provider.name}</h3></article>
          } else {
            return <article className="shadow-md p-2 flex flex-col justify-center gap-2 items-center">
              <HelpCircle />
              <h3 className="text-md">{provider.name}</h3>
            </article>
          }
        })}
      </section>
    </section>
  )
}