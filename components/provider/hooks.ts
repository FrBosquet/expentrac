import { useLoans } from '@components/loan/context'
import { useSubs } from '@components/subscription/context'
import { type Provider } from '@lib/prisma'
import { type BrandExtendedInfo } from '@types'

export const useProviderExtendedInfo = (provider: Provider) => {
  const { loans } = useLoans()
  const { subs } = useSubs()

  const extendedData = provider.rawContent as unknown as BrandExtendedInfo

  const url = `https://${extendedData.domain}`

  const fromLoans = {
    asVendor: loans.filter((item) => item.providers.vendor?.id === provider.id),
    asPlatform: loans.filter(
      (item) => item.providers.platform?.id === provider.id
    ),
    asLender: loans.filter((item) => item.providers.lender?.id === provider.id)
  }

  const fromSubs = {
    asVendor: subs.filter((item) => item.providers.vendor?.id === provider.id),
    asPlatform: subs.filter(
      (item) => item.providers.platform?.id === provider.id
    )
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
    asVendor:
      fromLoans.asVendor.reduce((acc, item) => acc + item.fee.monthly, 0) +
      fromSubs.asVendor.reduce((acc, item) => acc + item.fee.monthly, 0),
    asPlatform:
      fromLoans.asPlatform.reduce((acc, item) => acc + item.fee.monthly, 0) +
      fromSubs.asPlatform.reduce((acc, item) => acc + item.fee.monthly, 0),
    asLender: fromLoans.asLender.reduce(
      (acc, item) => acc + item.fee.monthly,
      0
    )
  }

  const hasAnyItem =
    lengths.asVendor > 0 || lengths.asPlatform > 0 || lengths.asLender > 0

  return {
    ...provider,
    url,
    fromLoans,
    fromSubs,
    lengths,
    totals,
    hasAnyItem,
    roles
  }
}
