jest.mock('@lib/server/schema-state', () => ({
  assertDatabaseReady: jest.fn(async () => {})
}))
import { prisma } from '@lib/prisma'
import { getServerSession } from 'next-auth'

import { changeSubscriptionPeriod } from './subscription-periods'

jest.mock('@lib/auth', () => ({ authOptions: {} }))
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    contract: { findUnique: jest.fn() },
    period: { create: jest.fn(), update: jest.fn() }
  }
}))
const form = () => {
  const value = new FormData()
  value.set('id', 'sub')
  value.set('date', '2026-10-14')
  value.set('fee', '12.50')
  return value
}
beforeEach(() => {
  jest.clearAllMocks()
  ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'owner' } })
  ;(prisma.$transaction as jest.Mock).mockImplementation((operation) =>
    operation(prisma)
  )
  ;(prisma.contract.findUnique as jest.Mock).mockResolvedValue({
    id: 'sub',
    userId: 'owner',
    type: 'SUBSCRIPTION',
    periods: [
      { id: 'period', from: new Date('2026-01-01'), to: null, payday: 14 }
    ]
  })
})
test.each(['pause', 'resume', 'price'] as const)(
  'anonymous %s action cannot query or write',
  async (action) => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    await expect(
      changeSubscriptionPeriod(form(), action)
    ).rejects.toMatchObject({ status: 401 })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  }
)
test.each(['pause', 'resume', 'price'] as const)(
  'third user cannot %s another user’s subscription',
  async (action) => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'third' }
    })
    await expect(
      changeSubscriptionPeriod(form(), action)
    ).rejects.toMatchObject({ status: 403 })
    expect(prisma.period.update).not.toHaveBeenCalled()
    expect(prisma.period.create).not.toHaveBeenCalled()
  }
)
test('price change closes and opens periods within one serializable transaction', async () => {
  await changeSubscriptionPeriod(form(), 'price')
  expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
    isolationLevel: 'Serializable'
  })
  expect(prisma.period.update).toHaveBeenCalledWith({
    where: { id: 'period' },
    data: { to: new Date('2026-10-13') }
  })
  expect(prisma.period.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        feeCents: 1250,
        from: new Date('2026-10-14')
      })
    })
  )
})
