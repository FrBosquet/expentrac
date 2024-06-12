import { UserProviderSummary } from '@components/provider/summary'

export default function Page() {
  return (
    <>
      <h1 className="col-span-2 pb-8 text-4xl font-semibold lg:col-span-4">
        Your providers
      </h1>
      <UserProviderSummary className="col-span-2 lg:col-span-4" />
    </>
  )
}
