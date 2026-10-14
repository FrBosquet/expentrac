import { type BrandExtendedInfo } from '@types'

export const fetchBrandInfo = async (
  domain: string
): Promise<BrandExtendedInfo> => {
  const response = await fetch(
    `https://api.brandfetch.io/v2/brands/${encodeURIComponent(domain)}`,
    {
      method: 'GET',
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${process.env.BRANDFETCH_KEY}`,
        accept: 'application/json'
      }
    }
  )

  if (!response.ok) throw new Error('Provider metadata is unavailable')
  const extendedData = (await response.json()) as BrandExtendedInfo

  if (
    !extendedData ||
    typeof extendedData.domain !== 'string' ||
    !Array.isArray(extendedData.logos) ||
    !Array.isArray(extendedData.colors)
  )
    throw new Error('Invalid provider metadata')
  return extendedData
}
