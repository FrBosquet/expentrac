import { assertDatabaseReady } from '@lib/server/schema-state'
import { updateContractLink } from '@lib/server/contract-relations'
import { recordInvitations } from '@lib/server/invitations'
import { eurosToCents } from '@lib/money'
import { authOptions } from '@lib/auth'
import { CONTRACT_TYPE } from '@lib/contract'
import { type LoanFormData } from '@lib/loan'
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
import { NOTIFICATION_TYPE, SELECT_OPTIONS } from '@types'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { include } from '../include'
interface Query {
  params: Promise<{ id: string }>
}

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
      const loan = await db.contract.findUnique({ where: { id }, include })

      if (!loan) {
        return NextResponse.json(
          {
            message: 'loan not found'
          },
          {
            status: 404
          }
        )
      }

      if (userId !== loan?.userId) {
        return NextResponse.json(
          {
            message: 'user does not own this resource'
          },
          {
            status: 403
          }
        )
      }

      if (loan.type !== CONTRACT_TYPE.LOAN) {
        return NextResponse.json(
          { message: 'Invalid contract type' },
          { status: 400 }
        )
      }

      if (loan.periods.length !== 1)
        throw new ApiError(
          409,
          'Loan periods require reconciliation before editing'
        )

      const body = (await contractInput(
        raw,
        CONTRACT_TYPE.LOAN,
        userId,
        db
      )) as unknown as LoanFormData

      // SHARES
      const sharedWithKeys = Object.entries(body)
        .filter(([key]) => key.startsWith('sharedWith'))
        .map(([_, value]) => value)
      const keysToDelete = loan.shares
        .filter((share) => !sharedWithKeys.includes(share.toId))
        .map((share) => ({ id: share.id }))
      const keysToCreate = sharedWithKeys.filter(
        (id) => !loan.shares.some((share) => share.toId === id)
      )

      await recordInvitations(db, userId, keysToCreate.length)

      const updatedLoan = await db.contract.update({
        where: {
          id
        },
        data: {
          name: body.name,
          feeCents: eurosToCents(body.initial),
          periods: {
            updateMany: {
              where: {
                id: loan.periods[0].id
              },
              data: {
                to: new Date(body.endDate).toISOString(),
                from: new Date(body.startDate).toISOString(),
                feeCents: eurosToCents(body.fee),
                payday: Number(body.payday)
              }
            }
          },
          providers: getProviderUpdateArgs(loan, body),
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
          resources: updateContractLink(loan.resources, body.link)
        },
        include
      })

      for (const toId of keysToCreate) {
        const share = updatedLoan.shares.find((share) => share.toId === toId)
        if (!share) continue
        const notification = await notificationSdk.create(
          share.toId,
          true,
          {
            type: NOTIFICATION_TYPE.LOAN_SHARE,
            contract: updatedLoan as Contract,
            share: { id: share.id }
          },
          db
        )
        if (notification) notificationIds.push(notification.id)
      }

      return NextResponse.json(
        { message: 'success', data: updatedLoan },
        { status: 200 }
      )
    },
    { isolationLevel: 'Serializable', timeout: 20000 }
  )
  await deliverNotifications(notificationIds)
  return response
}

const getProviderUpdateArgs = (
  loan: { providers: RawProvidersOnContract[] },
  body: LoanFormData
) => {
  const vendorProvider = loan.providers.find(
    (provider) => provider.as === PROVIDER_TYPE.VENDOR
  )
  const platformProvider = loan.providers.find(
    (provider) => provider.as === PROVIDER_TYPE.PLATFORM
  )
  const lenderProvider = loan.providers.find(
    (provider) => provider.as === PROVIDER_TYPE.LENDER
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
    getUpdate(platformProvider, body.platformId),
    getUpdate(lenderProvider, body.lenderId)
  ].filter(Boolean) as Prisma.ProvidersOnContractUpdateArgs[]

  const deleteMany = [
    vendorProvider && body.vendorId === SELECT_OPTIONS.NONE
      ? { id: vendorProvider.id }
      : undefined,
    platformProvider && body.platformId === SELECT_OPTIONS.NONE
      ? { id: platformProvider.id }
      : undefined,
    lenderProvider && body.lenderId === SELECT_OPTIONS.NONE
      ? { id: lenderProvider.id }
      : undefined
  ].filter(Boolean) as Prisma.ProvidersOnContractWhereUniqueInput[]

  const createMany = {
    data: [
      !vendorProvider && body.vendorId !== SELECT_OPTIONS.NONE
        ? { as: PROVIDER_TYPE.VENDOR, providerId: body.vendorId }
        : undefined,
      !platformProvider && body.platformId !== SELECT_OPTIONS.NONE
        ? { as: PROVIDER_TYPE.PLATFORM, providerId: body.platformId }
        : undefined,
      !lenderProvider && body.lenderId !== SELECT_OPTIONS.NONE
        ? { as: PROVIDER_TYPE.LENDER, providerId: body.lenderId }
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
