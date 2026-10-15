import { GET } from '../../app/api/notification/outbox/route'
import { deliverOutbox } from './outbox'

jest.mock('@lib/auth', () => ({ authOptions: {} }))
jest.mock('@lib/server/outbox', () => ({
  deliverOutbox: jest.fn(async () => ({ sent: 1, pending: 2, failed: 0 }))
}))
beforeEach(() => {
  jest.clearAllMocks()
  process.env.CRON_SECRET = 'worker-test'
})
afterEach(() => {
  delete process.env.CRON_SECRET
})
test.each([undefined, 'Bearer wrong'])(
  'worker rejects %s without claiming jobs',
  async (authorization) => {
    expect(
      (
        await GET(
          new Request('http://localhost', {
            headers: authorization ? { authorization } : {}
          })
        )
      ).status
    ).toBe(401)
    expect(deliverOutbox).not.toHaveBeenCalled()
  }
)
test('worker fails closed when unconfigured and returns only metrics when authorized', async () => {
  delete process.env.CRON_SECRET
  expect(
    (
      await GET(
        new Request('http://localhost', {
          headers: { authorization: 'Bearer undefined' }
        })
      )
    ).status
  ).toBe(401)
  process.env.CRON_SECRET = 'worker-test'
  expect(
    await (
      await GET(
        new Request('http://localhost', {
          headers: { authorization: 'Bearer worker-test' }
        })
      )
    ).json()
  ).toEqual({ sent: 1, pending: 2, failed: 0 })
})
