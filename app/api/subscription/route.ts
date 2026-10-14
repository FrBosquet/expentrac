import { authOptions } from '@lib/auth'
import { CONTRACT_TYPE } from '@lib/contract'
import { PERIODICITY } from '@lib/dates'
import { notificationSdk } from '@lib/notification'
import { type Contract, type Prisma, prisma, type Share } from '@lib/prisma'
import { PROVIDER_TYPE } from '@lib/provider'
import { apiResponse } from '@lib/server/api'
import { readContracts } from '@lib/server/reads'
import { contractInput, jsonObject } from '@lib/server/validation'
import { NOTIFICATION_TYPE, SELECT_OPTIONS } from '@types'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { subscriptionInclude } from './include'

export const GET = (req: Request) =>
  apiResponse(() => readContracts(req, CONTRACT_TYPE.SUBSCRIPTION))

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

  const body = (await contractInput(
    await jsonObject(req),
    CONTRACT_TYPE.SUBSCRIPTION,
    userId
  )) as any

  const keysToCreate = Object.entries(body)
    .filter(([key]) => key.startsWith('sharedWith'))
    .map(([_, value]) => value as string)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isYearly = body.yearly === 'on'

  const newSub = await prisma.contract.create({
    data: {
      user: {
        connect: {
          id: userId
        }
      },
      type: CONTRACT_TYPE.SUBSCRIPTION,
      name: body.name,
      fee: Number(body.initial),
      periods: {
        create: {
          from: today,
          fee: Number(body.fee),
          payday: body.payday ? Number(body.payday) : undefined,
          paymonth: body.paymonth ? Number(body.paymonth) : undefined,
          periodicity: isYearly ? PERIODICITY.YEARLY : PERIODICITY.MONTHLY
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
    include: subscriptionInclude
  })

  await Promise.all(
    newSub.shares.map(async (share) => {
      await notificationSdk.create(share.toId, true, {
        type: NOTIFICATION_TYPE.SUB_SHARE,
        contract: newSub as Contract,
        share: share as Share
      })
    })
  )

  return NextResponse.json(
    { message: 'success', data: newSub },
    { status: 201 }
  )
}

export const POST = (req: Request) => apiResponse(() => handlePOST(req))
