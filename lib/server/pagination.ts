import { ApiError } from './api'

export function pageOptions(req?: Request) {
  const params = req && new URL(req.url).searchParams
  const raw = params?.get('limit') ?? '100'
  const take = Number(raw)
  if (!/^\d+$/.test(raw) || !Number.isInteger(take) || take < 1 || take > 100)
    throw new ApiError(400, 'limit must be 1–100')
  const cursor = params?.get('cursor')
  if (cursor && (cursor.length > 128 || !/^[a-zA-Z0-9_:/-]+$/.test(cursor)))
    throw new ApiError(400, 'Invalid cursor')
  return { take, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) }
}

// Prisma uses cursor sort values before applying the list filter. Scope that
// lookup too, so another user's cursor cannot reveal ordering information.
export async function ownedPage(
  req: Request | undefined,
  find: (id: string) => PromiseLike<unknown>
) {
  const options = pageOptions(req)
  if (options.cursor && !(await find(options.cursor.id)))
    throw new ApiError(400, 'Invalid cursor')
  return options
}
