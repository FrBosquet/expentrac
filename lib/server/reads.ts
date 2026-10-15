import { CONTRACT_TYPE, subscriptionInclude } from '@lib/contract'
import { prisma } from '@lib/prisma'

import { ApiError, requireUser } from './api'
import { ownedPage, pageOptions } from './pagination'

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

export const profileSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  occupation: true
} as const
export async function readProfile(req?: Request) {
  return prisma.user.findUniqueOrThrow({
    where: { id: await requireUser(req) },
    select: profileSelect
  })
}
export async function readProviders(req?: Request) {
  await requireUser(req)
  return prisma.provider.findMany({
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    ...pageOptions(req)
  })
}

// Prefetch the same complete list as the browser SDK; a first page is never a full cache entry.
export async function readAll<T extends { id: string }>(
  reader: (req?: Request) => Promise<T[]>
): Promise<T[]> {
  const items: T[] = []
  const seen = new Set<string>()
  let cursor = ''
  for (let page = 0; page < 100; page++) {
    const records = await reader(
      new Request(
        `http://localhost/?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`
      )
    )
    for (const record of records) {
      if (seen.has(record.id))
        throw new ApiError(500, 'Inconsistent pagination')
      seen.add(record.id)
    }
    items.push(...records)
    if (records.length < 100) return items
    cursor = records[records.length - 1].id
  }
  throw new ApiError(
    400,
    'Too many records to display; narrow the requested data'
  )
}
