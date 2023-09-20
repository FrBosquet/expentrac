import { useLoans } from '@components/loan/context'
import { useSubs } from '@components/subscription/context'
import { type BrandExtendedInfo, type UserProviderComplete } from '@types'

export const useProviderExtendedInfo = (userProvider: UserProviderComplete) => {
  const { loans } = useLoans()
  const { subs } = useSubs()

  const { provider } = userProvider
  const extendedData = provider.rawContent as unknown as BrandExtendedInfo

  const url = `https://${extendedData.domain}`

  const fromLoans = {
    asVendor: loans.filter((item) => item.vendorId === userProvider.id),
    asPlatform: loans.filter((item) => item.platformId === userProvider.id),
    asLender: loans.filter((item) => item.lenderId === userProvider.id)
  }

  const fromSubs = {
    asVendor: subs.filter((item) => item.vendorId === userProvider.id),
    asPlatform: subs.filter((item) => item.platformId === userProvider.id)
  }

  const lengths = {
    asVendor: fromLoans.asVendor.length + fromSubs.asVendor.length,
    asPlatform: fromLoans.asPlatform.length + fromSubs.asPlatform.length,
    asLender: fromLoans.asLender.length
  }

  const roles = [
    lengths.asLender && 'lender',
    lengths.asVendor && 'vendor',
    lengths.asPlatform && 'platform'
  ].filter(Boolean)

  const totals = {
    asVendor: fromLoans.asVendor.reduce((acc, item) => acc + item.fee, 0) + fromSubs.asVendor.reduce((acc, item) => acc + item.fee, 0),
    asPlatform: fromLoans.asPlatform.reduce((acc, item) => acc + item.fee, 0) + fromSubs.asPlatform.reduce((acc, item) => acc + item.fee, 0),
    asLender: fromLoans.asLender.reduce((acc, item) => acc + item.fee, 0)
  }

  const hasAnyItem = lengths.asVendor > 0 || lengths.asPlatform > 0 || lengths.asLender > 0

  return {
    ...userProvider,
    provider,
    url,
    fromLoans,
    fromSubs,
    lengths,
    totals,
    hasAnyItem,
    roles
  }
}
