import { contract } from './decode'
import { arrayOf, HttpError, request } from './http'

const fetchMock = jest.fn()
beforeEach(() => {
  global.fetch = fetchMock
  fetchMock.mockReset()
})
test('HTTP failure is surfaced before data can enter the client cache', async () => {
  fetchMock.mockResolvedValue(
    Response.json({ message: 'Forbidden' }, { status: 403 })
  )
  await expect(request('contract')).rejects.toMatchObject({
    status: 403,
    message: 'Forbidden'
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
test('non-JSON and malformed resource responses become transport errors', async () => {
  fetchMock.mockResolvedValue(
    new Response('<html>Error</html>', { status: 502 })
  )
  await expect(request('contract')).rejects.toBeInstanceOf(HttpError)
  fetchMock.mockResolvedValue(Response.json([{ id: 'missing-fields' }]))
  await expect(
    request('contract', {}, arrayOf(contract))
  ).rejects.toMatchObject({ message: 'Server returned an invalid response' })
})
test('date DTO fields are restored for domain calculations', async () => {
  fetchMock.mockResolvedValue(
    Response.json([
      {
        id: 'c',
        userId: 'u',
        type: 'WORK',
        feeCents: null,
        user: { id: 'u', name: null, image: null },
        periods: [
          { from: '2026-10-14T00:00:00.000Z', to: null, feeCents: 100 }
        ],
        providers: [],
        shares: [],
        resources: []
      }
    ])
  )
  const contracts = await request('contract', {}, arrayOf(contract))
  expect(contracts[0].periods[0].from).toBeInstanceOf(Date)
})
test('writes are not retried after a network failure', async () => {
  fetchMock.mockRejectedValue(new Error('offline'))
  await expect(request('loan', { method: 'POST' })).rejects.toMatchObject({
    status: 0
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('paged reads forward the cursor and reject duplicate rows', async () => {
  const { allPages } = await import('./http')
  const decode = (value: unknown) => value as { id: string }
  fetchMock
    .mockResolvedValueOnce(
      Response.json(
        Array.from({ length: 100 }, (_, id) => ({ id: String(id) }))
      )
    )
    .mockResolvedValueOnce(Response.json([{ id: 'last' }]))
  expect(await allPages('contract', decode)).toHaveLength(101)
  expect(fetchMock.mock.calls[1][0]).toContain('cursor=99')
  fetchMock
    .mockReset()
    .mockResolvedValueOnce(
      Response.json(
        Array.from({ length: 100 }, (_, id) => ({ id: String(id) }))
      )
    )
    .mockResolvedValueOnce(Response.json([{ id: '99' }]))
  await expect(allPages('contract', decode)).rejects.toMatchObject({
    message: 'Inconsistent pagination'
  })
})

test('nested accepted-share decoding preserves already restored dates', async () => {
  const { share } = await import('./decode')
  const raw = {
    id: 'share',
    fromId: 'owner',
    toId: 'recipient',
    accepted: true,
    contract: {
      id: 'loan',
      userId: 'owner',
      type: 'LOAN',
      feeCents: 501,
      user: { id: 'owner', name: 'Owner', image: null },
      periods: [
        {
          from: '2026-01-15T00:00:00.000Z',
          to: '2028-12-31T00:00:00.000Z',
          feeCents: 1002
        }
      ],
      providers: [],
      shares: [],
      resources: []
    }
  }
  const decoded = share(raw)
  expect(decoded.contract!.periods[0].from).toBeInstanceOf(Date)
  expect(decoded.contract!.periods[0].from.toISOString()).toBe(
    raw.contract.periods[0].from
  )
  expect(share(decoded).contract!.periods[0].from).toBeInstanceOf(Date)
})
