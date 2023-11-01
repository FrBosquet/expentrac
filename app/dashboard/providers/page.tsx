import { UserProviderSummary } from '@components/provider/summary'

export default function Page() {
  return (
    <>
      <h1 className="text-4xl font-semibold col-span-2 lg:col-span-4 pb-8">Your providers</h1>
      <UserProviderSummary className='col-span-2 lg:col-span-4' />
    </>
  )
}
