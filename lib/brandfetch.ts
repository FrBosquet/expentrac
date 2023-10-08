import { type BrandExtendedInfo } from '@types'

export const fetchBrandInfo = async (domain: string): Promise<BrandExtendedInfo> => {
  const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.BRANDFETCH_KEY}`,
      accept: 'application/json'
    }
  })

  const extendedData = await response.json() as BrandExtendedInfo

  return extendedData
}
