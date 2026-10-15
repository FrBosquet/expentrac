import { QueryObserver } from '@tanstack/react-query'
import {
  createQueryClient,
  invalidateResources,
  keys,
  getSessionQueryClient,
  clearSessionQueryClient
} from './query-policy'

test('writes refresh dependent resources without invalidating another account or catalog', async () => {
  const client = createQueryClient()
  const contracts = keys.resource('owner', 'contracts')
  client.setQueryData(contracts, ['before'])
  client.setQueryData(keys.resource('owner', 'shares'), ['share'])
  client.setQueryData(keys.resource('owner', 'providers'), ['provider'])
  client.setQueryData(keys.resource('recipient', 'contracts'), ['private'])
  let finish!: (value: string[]) => void
  const observer = new QueryObserver(client, {
    queryKey: contracts,
    queryFn: () =>
      new Promise<string[]>((resolve) => {
        finish = resolve
      }),
    staleTime: 60_000
  })
  const unsubscribe = observer.subscribe(() => {})
  let completed = false
  const invalidation = invalidateResources(client, 'owner', [
    'contracts',
    'shares'
  ]).then(() => {
    completed = true
  })
  await Promise.resolve()
  expect(completed).toBe(false)
  expect(client.getQueryData(contracts)).toEqual(['before'])
  finish(['after'])
  await invalidation
  expect(client.getQueryData(contracts)).toEqual(['after'])
  expect(
    client.getQueryState(keys.resource('owner', 'shares'))?.isInvalidated
  ).toBe(true)
  expect(
    client.getQueryState(keys.resource('owner', 'providers'))?.isInvalidated
  ).toBe(false)
  expect(
    client.getQueryState(keys.resource('recipient', 'contracts'))?.isInvalidated
  ).toBe(false)
  unsubscribe()
  client.clear()
})

test('session cleanup cancels an in-flight read and prevents it repopulating private data', async () => {
  const client = createQueryClient()
  let finish!: (value: string[]) => void
  const key = keys.resource('owner', 'contracts')
  const pending = client
    .fetchQuery({
      queryKey: key,
      queryFn: () =>
        new Promise<string[]>((resolve) => {
          finish = resolve
        })
    })
    .catch(() => undefined)
  await client.cancelQueries()
  client.clear()
  finish(['private'])
  await pending
  expect(client.getQueryData(key)).toBeUndefined()
  expect(createQueryClient().getQueryData(key)).toBeUndefined()
})

test('only transient failures retry and mutations never retry automatically', () => {
  const client = createQueryClient()
  const retry = client.getDefaultOptions().queries?.retry as (
    count: number,
    error: Error
  ) => boolean
  for (const status of [400, 401, 403, 404, 409, 200])
    expect(retry(0, Object.assign(new Error(), { status }))).toBe(false)
  for (const status of [0, 500, 503]) {
    expect(retry(0, Object.assign(new Error(), { status }))).toBe(true)
    expect(retry(2, Object.assign(new Error(), { status }))).toBe(false)
  }
  expect(client.getDefaultOptions().mutations?.retry).toBe(false)
  client.clear()
})

test('browser client survives render retries while account changes clear the old cache', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} })
  try {
    const owner = getSessionQueryClient('owner')
    const key = keys.resource('owner', 'contracts')
    owner.setQueryData(key, ['private'])
    expect(getSessionQueryClient('owner')).toBe(owner)
    const recipient = getSessionQueryClient('recipient')
    expect(recipient).not.toBe(owner)
    expect(owner.getQueryData(key)).toBeUndefined()
    expect(recipient.getQueryData(key)).toBeUndefined()
    clearSessionQueryClient()
    expect(getSessionQueryClient('recipient')).not.toBe(recipient)
  } finally {
    clearSessionQueryClient()
    if (original) Object.defineProperty(globalThis, 'window', original)
    else Reflect.deleteProperty(globalThis, 'window')
  }
})

test('server renders never share a query client even for the same account', () => {
  expect(getSessionQueryClient('owner')).not.toBe(
    getSessionQueryClient('owner')
  )
})
