import { hydrate } from '@tanstack/react-query'
import {
  createQueryClient,
  keys,
  privateHydrationState
} from '@lib/query-policy'
import { prefetchDashboard } from './dashboard-prefetch'
import { requireUser } from './api'
import { readProfile } from './reads'

jest.mock('./api', () => ({ requireUser: jest.fn() }))
jest.mock('./reads', () => ({
  readAll: jest.fn((reader) => reader()),
  readContracts: jest.fn(),
  readShares: jest.fn(),
  readNotifications: jest.fn(),
  readProviderRelations: jest.fn(),
  readProviders: jest.fn(),
  readProfile: jest.fn()
}))

beforeEach(() => jest.resetAllMocks())

test('concurrent server requests have independent caches and hydration needs no duplicate read', async () => {
  ;(requireUser as jest.Mock)
    .mockResolvedValueOnce('owner')
    .mockResolvedValueOnce('recipient')
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  ;(readProfile as jest.Mock)
    .mockImplementationOnce(async () => {
      await gate
      return { id: 'owner', name: 'Owner' }
    })
    .mockResolvedValueOnce({ id: 'recipient', name: 'Recipient' })
  const owner = prefetchDashboard(['profile'])
  const recipient = await prefetchDashboard(['profile'])
  release()
  const ownerState = await owner
  expect(ownerState.queries.map((query) => query.queryKey)).toEqual([
    keys.resource('owner', 'profile')
  ])
  expect(recipient.queries.map((query) => query.queryKey)).toEqual([
    keys.resource('recipient', 'profile')
  ])
  const client = createQueryClient()
  hydrate(client, privateHydrationState(ownerState, 'owner'))
  const read = jest.fn()
  expect(
    await client.fetchQuery({
      queryKey: keys.resource('owner', 'profile'),
      queryFn: read
    })
  ).toEqual({ id: 'owner', name: 'Owner' })
  expect(read).not.toHaveBeenCalled()
  expect(privateHydrationState(ownerState, 'recipient').queries).toEqual([])
  expect(
    client.getQueryData(keys.resource('recipient', 'profile'))
  ).toBeUndefined()
  client.clear()
})

test('failed prefetch is omitted so the client can recover through the normal query state', async () => {
  ;(requireUser as jest.Mock).mockResolvedValue('owner')
  ;(readProfile as jest.Mock).mockRejectedValue(
    Object.assign(new Error('Unavailable'), { status: 403 })
  )
  expect((await prefetchDashboard(['profile'])).queries).toEqual([])
})
