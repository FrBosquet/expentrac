import { UserProviderSummary } from '@components/provider/summary'

export default function Page() {
  return (
    <section className="flex-1 w-screen max-w-3xl p-12 m-auto flex flex-col gap-4">
      <h1 className="text-3xl">Your providers</h1>
      <p className="text-slate-500">The companies and services that you use to buy, to pay or to get money from.</p>
      <UserProviderSummary />
    </section>
  )
}
