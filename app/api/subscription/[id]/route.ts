import { assertDatabaseReady } from '@lib/server/schema-state'
import { updateContractLink } from '@lib/server/contract-relations'
import { recordInvitations } from '@lib/server/invitations'
import { eurosToCents } from '@lib/money'
import { authOptions } from '@lib/auth'
import { CONTRACT_TYPE } from '@lib/contract'
import { PERIODICITY } from '@lib/dates'
import { notificationSdk, deliverNotifications } from '@lib/notification'
import {
  type Contract,
  type Prisma,
  prisma,
  type RawProvidersOnContract,
  type Share
} from '@lib/prisma'
import { PROVIDER_TYPE } from '@lib/provider'
import { apiResponse, ApiError } from '@lib/server/api'
import { contractInput, jsonObject } from '@lib/server/validation'
import { type SubFormData } from '@lib/sub'
import { NOTIFICATION_TYPE, SELECT_OPTIONS } from '@types'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { subscriptionInclude } from '../include'

interface Query {
  params: Promise<{ id: string }>
}

// TODO: This looks almost exactly the same as loan patch. Can we combine them into Contract?
// Only difference is the Lender and that means nothing in terms of DB structure. Just using the patch from loan should work almost OOB
const handlePATCH = async (req: Request, { params }: Query) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      {
        message: 'forbidden'
      },
      {
        status: 401
      }
    )
  }

  const { id } = await params

  if (!id) {
    return NextResponse.json(
      {
        message: 'id is required'
      },
      {
        status: 400
      }
    )
  }

  const userId = session.user.id
  await assertDatabaseReady()

  const raw = await jsonObject(req)
  const notificationIds: string[] = []
  const response = await prisma.$transaction(
    async (db) => {
      const sub = await db.contract.findUnique({
        where: { id },
        include: subscriptionInclude
      })

      if (!sub) {
        return NextResponse.json(
          {
            message: 'sub not found'
          },
          {
            status: 404
          }
        )
      }

      if (userId !== sub?.userId) {
        return NextResponse.json(
          {
            message: 'user does not own this resource'
          },
          {
            status: 403
          }
        )
      }

      if (sub.type !== CONTRACT_TYPE.SUBSCRIPTION) {
        return NextResponse.json(
          { message: 'Invalid contract type' },
          { status: 400 }
        )
      }

      const activePeriods = sub.periods.filter((period) => period.to === null)
      if (activePeriods.length !== 1)
        throw new ApiError(
          409,
          'Resume the subscription before editing billing settings'
        )
      const activePeriod = activePeriods[0]

      const body = (await contractInput(
        raw,
        CONTRACT_TYPE.SUBSCRIPTION,
        userId,
        db
      )) as unknown as SubFormData

      // SHARES
      const sharedWithKeys = Object.entries(body)
        .filter(([key]) => key.startsWith('sharedWith'))
        .map(([_, value]) => value as string)
      const keysToDelete = sub.shares
        .filter((share) => !sharedWithKeys.includes(share.toId))
        .map((share) => ({ id: share.id }))
      const keysToCreate = sharedWithKeys.filter(
        (id) => !sub.shares.some((share) => share.toId === id)
      )

      const isYearly = body.yearly === 'on'

      await recordInvitations(db, userId, keysToCreate.length)

      const updatedSub = await db.contract.update({
        where: {
          id
        },
        data: {
          name: body.name,
          feeCents: eurosToCents(body.initial),
          periods: {
            updateMany: {
              where: {
                id: activePeriod.id
              },
              data: {
                feeCents: eurosToCents(body.fee),
                payday: body.payday ? Number(body.payday) : undefined,
                paymonth:
                  body.paymonth !== undefined ? Number(body.paymonth) : null,
                periodicity: isYearly ? PERIODICITY.YEARLY : PERIODICITY.MONTHLY
              }
            }
          },
          providers: getProviderUpdateArgs(sub, body),
          shares: {
            createMany: {
              data: keysToCreate.map((toId) => ({
                fromId: userId,
                toId
              }))
            },
            deleteMany: {
              OR: keysToDelete
            }
          },
          resources: updateContractLink(sub.resources, body.link)
        },
        include: subscriptionInclude
      })

      for (const toId of keysToCreate) {
        const share = updatedSub.shares.find((share) => share.toId === toId)
        if (!share) continue
        const notification = await notificationSdk.create(
          share.toId,
          true,
          {
            type: NOTIFICATION_TYPE.SUB_SHARE,
            contract: updatedSub as Contract,
            share: { id: share.id }
          },
          db
        )
        if (notification) notificationIds.push(notification.id)
      }

      return NextResponse.json(
        { message: 'success', data: updatedSub },
        { status: 200 }
      )
    },
    { isolationLevel: 'Serializable', timeout: 20000 }
  )
  await deliverNotifications(notificationIds)
  return response
}

const getProviderUpdateArgs = (
  sub: { providers: RawProvidersOnContract[] },
  body: SubFormData
) => {
  const vendorProvider = sub.providers.find(
    (provider) => provider.as === PROVIDER_TYPE.VENDOR
  )
  const platformProvider = sub.providers.find(
    (provider) => provider.as === PROVIDER_TYPE.PLATFORM
  )

  const getUpdate = (
    providerOnContract: RawProvidersOnContract | undefined,
    providerId: string | undefined
  ) => {
    if (!providerOnContract) return undefined
    if (providerOnContract.providerId === providerId) return undefined
    if (providerId === SELECT_OPTIONS.NONE) return undefined

    return {
      where: { id: providerOnContract.id },
      data: { providerId }
    }
  }

  const updateMany = [
    getUpdate(vendorProvider, body.vendorId),
    getUpdate(platformProvider, body.platformId)
  ].filter(Boolean) as Prisma.ProvidersOnContractUpdateArgs[]

  const deleteMany = [
    vendorProvider && body.vendorId === SELECT_OPTIONS.NONE
      ? { id: vendorProvider.id }
      : undefined,
    platformProvider && body.platformId === SELECT_OPTIONS.NONE
      ? { id: platformProvider.id }
      : undefined
  ].filter(Boolean) as Prisma.ProvidersOnContractWhereUniqueInput[]

  const createMany = {
    data: [
      !vendorProvider && body.vendorId !== SELECT_OPTIONS.NONE
        ? { as: PROVIDER_TYPE.VENDOR, providerId: body.vendorId }
        : undefined,
      !platformProvider && body.platformId !== SELECT_OPTIONS.NONE
        ? { as: PROVIDER_TYPE.PLATFORM, providerId: body.platformId }
        : undefined
    ].filter(Boolean) as Prisma.ProvidersOnContractCreateManyInput[]
  }

  return {
    updateMany,
    deleteMany,
    createMany
  }
}

export const PATCH = (req: Request, query: Query) =>
  apiResponse(() => handlePATCH(req, query))
