import { notificationSdk } from '@lib/notification'
import { prisma } from '@lib/prisma'
import { getServerSession } from 'next-auth'

import { GET as detail } from '../../app/api/contract/[id]/route'
import { GET as contracts } from '../../app/api/contract/route'
import { GET as loans } from '../../app/api/loan/route'
import { GET as notifications } from '../../app/api/notification/route'
import { GET as providers } from '../../app/api/provider-on-contract/route'
import { PATCH as acceptShare } from '../../app/api/share/[id]/route'
import { GET as shares } from '../../app/api/share/route'
import { GET as subscriptions } from '../../app/api/subscription/route'
import { GET as users } from '../../app/api/user/route'

jest.mock('@lib/auth', () => ({ authOptions: {} }))
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('next-auth/next', () => ({
  getServerSession: (...args: unknown[]) =>
    (getServerSession as jest.Mock)(...args)
}))
jest.mock('@lib/notification', () => ({
  notificationSdk: { create: jest.fn() }
}))
jest.mock('@lib/prisma', () => ({
  prisma: {
    contract: { findMany: jest.fn(), findUnique: jest.fn() },
    share: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    notification: { findMany: jest.fn() },
    providersOnContract: { findMany: jest.fn() },
    user: { findMany: jest.fn() }
  }
}))

const session = getServerSession as jest.Mock
const request = (query = '') => new Request(`http://localhost/api/test${query}`)
const readers = [
  contracts,
  loans,
  subscriptions,
  shares,
  notifications,
  providers
]

beforeEach(() => {
  jest.clearAllMocks()
  session.mockResolvedValue({ user: { id: 'owner' } })
  for (const model of Object.values(prisma)) {
    if (model && typeof model === 'object' && 'findMany' in model) {
      ;(model.findMany as jest.Mock).mockResolvedValue([])
    }
  }
})

test.each(readers)(
  'private reader rejects anonymous requests without querying',
  async (read) => {
    session.mockResolvedValue(null)
    expect((await read(request())).status).toBe(401)
    expect(prisma.contract.findMany).not.toHaveBeenCalled()
    expect(prisma.share.findMany).not.toHaveBeenCalled()
    expect(prisma.notification.findMany).not.toHaveBeenCalled()
    expect(prisma.providersOnContract.findMany).not.toHaveBeenCalled()
  }
)

test.each(readers)('private reader rejects a forged userId', async (read) => {
  expect((await read(request('?userId=other'))).status).toBe(403)
})

test('contract filter retains subscription type and session identity', async () => {
  expect((await contracts(request('?type=SUBSCRIPTION'))).status).toBe(200)
  expect(prisma.contract.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { userId: 'owner', type: 'SUBSCRIPTION' }
    })
  )
  expect((await contracts(request('?type=OTHER'))).status).toBe(400)
})

test('notification ack is optional and can filter false', async () => {
  await notifications(request('?ack=false'))
  expect(prisma.notification.findMany).toHaveBeenLastCalledWith(
    expect.objectContaining({ where: { userId: 'owner', ack: false } })
  )
  await notifications(request())
  expect(prisma.notification.findMany).toHaveBeenLastCalledWith(
    expect.objectContaining({ where: { userId: 'owner', ack: undefined } })
  )
})

test('user search rejects empty searches and selects limited fields', async () => {
  expect((await users(request())).status).toBe(400)
  expect(prisma.user.findMany).not.toHaveBeenCalled()
  await users(request('?search=foo'))
  expect(prisma.user.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      select: { id: true, name: true, email: true, image: true },
      take: 20
    })
  )
})

test.each([
  ['owner', null, 200],
  ['recipient', true, 200],
  ['recipient', null, 403],
  ['recipient', false, 403],
  ['third', true, 403]
])(
  'contract detail access for %s with acceptance %s',
  async (id, accepted, status) => {
    session.mockResolvedValue({ user: { id } })
    ;(prisma.contract.findUnique as jest.Mock).mockResolvedValue({
      userId: 'owner',
      shares: [{ toId: 'recipient', accepted }]
    })
    expect(
      (await detail(request(), { params: { id: 'contract' } })).status
    ).toBe(status)
  }
)

test('third user cannot modify a share or trigger email', async () => {
  ;(prisma.share.findUnique as jest.Mock).mockResolvedValue({
    toId: 'recipient'
  })
  const response = await acceptShare(
    new Request('http://localhost', {
      method: 'PATCH',
      body: '{"accepted":true}'
    }),
    { params: { id: 'share' } }
  )
  expect(response.status).toBe(403)
  expect(prisma.share.update).not.toHaveBeenCalled()
  expect(notificationSdk.create).not.toHaveBeenCalled()
})

test.each(['true', 1, null])(
  'recipient cannot pass nonboolean accepted %s',
  async (accepted) => {
    session.mockResolvedValue({ user: { id: 'recipient' } })
    ;(prisma.share.findUnique as jest.Mock).mockResolvedValue({
      toId: 'recipient'
    })
    const response = await acceptShare(
      new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({ accepted })
      }),
      { params: { id: 'share' } }
    )
    expect(response.status).toBe(400)
    expect(prisma.share.update).not.toHaveBeenCalled()
  }
)
