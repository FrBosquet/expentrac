import { HttpError, arrayOf, isObject } from './http'

export interface Brand {
  name: string
  domain: string
  icon: string
  brandId: string
}

function decodeBrand(value: unknown): Brand {
  if (
    !isObject(value) ||
    !['name', 'domain', 'icon', 'brandId'].every(
      (key) => typeof value[key] === 'string'
    )
  )
    throw new Error('Invalid brand')
  return value as unknown as Brand
}

export async function searchBrands(
  term: string,
  signal?: AbortSignal
): Promise<Brand[]> {
  const response = await fetch(
    `https://api.brandfetch.io/v2/search/${encodeURIComponent(term)}`,
    {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15_000)])
        : AbortSignal.timeout(15_000)
    }
  )
  if (!response.ok)
    throw new HttpError(
      response.status,
      'Brand search failed; please try again'
    )
  try {
    return arrayOf(decodeBrand)(await response.json())
  } catch {
    throw new HttpError(
      response.status,
      'Brand search returned an invalid response'
    )
  }
}
