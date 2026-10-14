export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  decode: (value: unknown) => T = (value) => value as T
): Promise<T> {
  const signal = init.signal
    ? AbortSignal.any([init.signal, AbortSignal.timeout(15_000)])
    : AbortSignal.timeout(15_000)
  let response: Response
  try {
    response = await fetch(`/api/${path.replace(/^\/+/, '')}`, {
      ...init,
      cache: 'no-store',
      credentials: 'same-origin',
      signal,
      headers: { 'Content-Type': 'application/json', ...init.headers }
    })
  } catch (error) {
    if (init.signal?.aborted) throw error
    throw new HttpError(0, 'Unable to reach the server; please try again')
  }
  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new HttpError(response.status, 'Server returned an invalid response')
  }
  if (!response.ok) {
    const message =
      isObject(body) && typeof body.message === 'string'
        ? body.message
        : 'Request failed'
    throw new HttpError(response.status, message)
  }
  try {
    return decode(body)
  } catch {
    throw new HttpError(response.status, 'Server returned an invalid response')
  }
}
export function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
export function arrayOf<T>(decode: (value: unknown) => T) {
  return (value: unknown): T[] => {
    if (!Array.isArray(value)) throw new Error('Expected array')
    return value.map(decode)
  }
}
export function envelope<T>(decode: (value: unknown) => T, key = 'data') {
  return (value: unknown): T => {
    if (!isObject(value)) throw new Error('Expected envelope')
    return decode(value[key])
  }
}
// Dates cross HTTP as ISO strings. Domain models keep Dates at the browser boundary.
const dateKeys = new Set([
  'createdAt',
  'updatedAt',
  'from',
  'to',
  'date',
  'startDate',
  'endDate'
])
export function restoreDates(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(restoreDates)
  if (!isObject(value)) return value
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => {
      if (
        dateKeys.has(key) &&
        typeof child === 'string' &&
        /^\d{4}-\d{2}-\d{2}T/.test(child)
      ) {
        const date = new Date(child)
        if (!Number.isFinite(date.getTime())) throw new Error('Invalid date')
        return [key, date]
      }
      return [key, restoreDates(child)]
    })
  )
}
