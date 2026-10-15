import { CONTRACT_TYPE, subscriptionInclude } from '@lib/contract'
import { prisma } from '@lib/prisma'

import { ApiError, requireUser } from './api'
import { ownedPage } from './pagination'

const shareInclude = {
  to: true,
  from: true,
  contract: { include: subscriptionInclude }
}

export async function readContracts(req?: Request, fixedType?: CONTRACT_TYPE) {
  const userId = await requireUser(req)
  const type = fixedType ?? (req && new URL(req.url).searchParams.get('type'))
  if (type && !Object.values(CONTRACT_TYPE).includes(type as CONTRACT_TYPE)) {
    throw new ApiError(400, 'Invalid contract type')
  }
  return prisma.contract.findMany({
    ...(await ownedPage(req, (id) =>
      prisma.contract.findFirst({
        where: { id, userId, type: type || undefined },
        select: { id: true }
      })
    )),
    where: { userId, type: type || undefined },
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    include: subscriptionInclude
  })
}

export async function readShares(req?: Request) {
  const userId = await requireUser(req)
  return prisma.share.findMany({
    ...(await ownedPage(req, (id) =>
      prisma.share.findFirst({
        where: { id, toId: userId },
        select: { id: true }
      })
    )),
    where: { toId: userId },
    orderBy: { id: 'asc' },
    include: shareInclude
  })
}

export async function readNotifications(req?: Request) {
  const userId = await requireUser(req)
  const ack = req && new URL(req.url).searchParams.get('ack')
  if (ack && ack !== 'true' && ack !== 'false')
    throw new ApiError(400, 'Invalid ack filter')
  return prisma.notification.findMany({
    ...(await ownedPage(req, (id) =>
      prisma.notification.findFirst({
        where: { id, userId, ack: ack ? ack === 'true' : undefined },
        select: { id: true }
      })
    )),
    where: { userId, ack: ack ? ack === 'true' : undefined },
    orderBy: [{ date: 'desc' }, { id: 'desc' }]
  })
}

export async function readProviderRelations(req?: Request) {
  const userId = await requireUser(req)
  return prisma.providersOnContract.findMany({
    ...(await ownedPage(req, (id) =>
      prisma.providersOnContract.findFirst({
        where: { id, contract: { userId } },
        select: { id: true }
      })
    )),
    where: { contract: { userId } },
    orderBy: [{ provider: { name: 'asc' } }, { id: 'asc' }],
    include: { provider: true }
  })
}
