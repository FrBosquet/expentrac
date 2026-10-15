jest.mock('@lib/server/schema-state', () => ({
  assertDatabaseReady: jest.fn(async () => {})
}))
import { notificationSdk } from '@lib/notification'
import { prisma } from '@lib/prisma'

import { GET } from '../../app/api/notification/cron/route'

jest.mock('@lib/notification', () => ({
  notificationSdk: { create: jest.fn() }
}))
jest.mock('@lib/server/outbox', () => ({
  deliverOutbox: jest.fn(async () => ({ sent: 0, failed: 0, pending: 0 }))
}))
jest.mock('@lib/prisma', () => ({
  prisma: {
    period: { findMany: jest.fn() },
    invitationEvent: { deleteMany: jest.fn() },
    notification: { findUnique: jest.fn(), deleteMany: jest.fn() }
  }
}))

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers().setSystemTime(new Date('2026-10-14T10:00:00Z'))
  process.env.CRON_SECRET = 'test-secret'
})
afterEach(() => {
  jest.useRealTimers()
  delete process.env.CRON_SECRET
})

test.each([undefined, 'Bearer wrong'])(
  'cron rejects unauthorized request %s before database work',
  async (authorization) => {
    const response = await GET(
      new Request('http://localhost', {
        headers: authorization ? { authorization } : {}
      })
    )
    expect(response.status).toBe(401)
    expect(prisma.period.findMany).not.toHaveBeenCalled()
  }
)

test('cron fails closed when no secret is configured', async () => {
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
})

test('cron excludes work, deduplicates contracts and skips a persisted daily notification', async () => {
  const contract = { id: 'loan', userId: 'owner', type: 'LOAN' }
  ;(prisma.period.findMany as jest.Mock).mockResolvedValue(
    [1, 2].map((id) => ({
      id,
      contractId: 'loan',
      contract,
      from: new Date('2020-01-01'),
      to: null,
      payday: 14
    }))
  )
  ;(prisma.notification.findUnique as jest.Mock).mockResolvedValue({
    id: 'daily/owner/2026-10-14'
  })
  const response = await GET(
    new Request('http://localhost', {
      headers: { authorization: 'Bearer test-secret' }
    })
  )
  expect(prisma.period.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { contract: { type: { in: ['LOAN', 'SUBSCRIPTION'] } } }
    })
  )
  expect(notificationSdk.create).not.toHaveBeenCalled()
  expect(await response.json()).toMatchObject({
    day: '2026-10-14',
    queued: 0,
    users: 1
  })
})
