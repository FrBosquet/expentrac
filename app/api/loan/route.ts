import { recordInvitations } from '@lib/server/invitations'
import { eurosToCents } from '@lib/money'
import { authOptions } from '@lib/auth'
import { CONTRACT_TYPE } from '@lib/contract'
import { notificationSdk, deliverNotifications } from '@lib/notification'
import { type Contract, type Prisma, prisma, type Share } from '@lib/prisma'
import { PROVIDER_TYPE } from '@lib/provider'
import { apiResponse } from '@lib/server/api'
import { readContracts } from '@lib/server/reads'
import { contractInput, jsonObject } from '@lib/server/validation'
import { NOTIFICATION_TYPE, SELECT_OPTIONS } from '@types'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { include } from './include'

export const GET = (req: Request) =>
  apiResponse(() => readContracts(req, CONTRACT_TYPE.LOAN))

const handlePOST = async (req: Request) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      {
        message: 'userId is required'
      },
      {
        status: 401
      }
    )
  }

  const userId = session.user.id

  const raw = await jsonObject(req)
  const notificationIds: string[] = []
  const response = await prisma.$transaction(
    async (db) => {
      const body = (await contractInput(
        raw,
        CONTRACT_TYPE.LOAN,
        userId,
        db
      )) as any

      const keysToCreate = Object.entries(body)
        .filter(([key]) => key.startsWith('sharedWith'))
        .map(([_, value]) => value as string)

      await recordInvitations(db, userId, keysToCreate.length)

      const newLoan = await db.contract.create({
        data: {
          user: {
            connect: {
              id: userId
            }
          },
          type: CONTRACT_TYPE.LOAN,
          name: body.name,
          feeCents: eurosToCents(body.initial),
          periods: {
            create: {
              to: new Date(body.endDate).toISOString(),
              from: new Date(body.startDate).toISOString(),
              feeCents: eurosToCents(body.fee),
              payday: body.payday ?? new Date(body.startDate).getDate()
            }
          },
          providers: {
            createMany: {
              data: [
                body.vendorId !== SELECT_OPTIONS.NONE
                  ? { as: PROVIDER_TYPE.VENDOR, providerId: body.vendorId }
                  : undefined,
                body.platformId !== SELECT_OPTIONS.NONE
                  ? { as: PROVIDER_TYPE.PLATFORM, providerId: body.platformId }
                  : undefined,
                body.lenderId !== SELECT_OPTIONS.NONE
                  ? { as: PROVIDER_TYPE.LENDER, providerId: body.lenderId }
                  : undefined
              ].filter(Boolean) as Prisma.ProvidersOnContractCreateManyInput[]
            }
          },
          shares: {
            createMany: {
              data: keysToCreate.map((toId) => ({
                fromId: userId,
                toId
              }))
            }
          },
          resources: {
            create: {
              name: 'link',
              type: 'LINK',
              url: body.link
            }
          }
        },
        include
      })

      for (const share of newLoan.shares) {
        const notification = await notificationSdk.create(
          share.toId,
          true,
          {
            type: NOTIFICATION_TYPE.LOAN_SHARE,
            contract: newLoan as Contract,
            share: { id: share.id }
          },
          db
        )
        if (notification) notificationIds.push(notification.id)
      }

      return NextResponse.json(
        { message: 'success', data: newLoan },
        { status: 201 }
      )
    },
    { isolationLevel: 'Serializable', timeout: 20000 }
  )
  await deliverNotifications(notificationIds)
  return response
}

export const POST = (req: Request) => apiResponse(() => handlePOST(req))
