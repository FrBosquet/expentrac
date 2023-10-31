import { authOptions } from '@lib/auth'
import { CONTRACT_TYPE } from '@lib/contract'
import { notificationSdk } from '@lib/notification'
import { prisma, type Contract, type Prisma, type Share } from '@lib/prisma'
import { PROVIDER_TYPE } from '@lib/provider'
import { NOTIFICATION_TYPE, SELECT_OPTIONS } from '@types'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { include } from './include'

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({
      message: 'userId is required'
    }, {
      status: 400
    })
  }

  const subs = await prisma.contract.findMany({
    where: {
      userId,
      type: CONTRACT_TYPE.SUBSCRIPTION
    },
    orderBy: [
      {
        name: 'asc'
      }
    ],
    include
  })

  return NextResponse.json(subs)
}

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({
      message: 'userId is required'
    }, {
      status: 400
    })
  }

  const userId = session.user.id

  const body = await req.json()

  const keysToCreate = Object.entries(body).filter(([key]) => key.startsWith('sharedWith')).map(([_, value]) => value as string)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

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
          periodicity: body.periodicity
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
          data: keysToCreate.map(toId => ({
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

  newSub.shares.forEach(share => {
    void notificationSdk.create(share.toId, true, {
      type: NOTIFICATION_TYPE.SUB_SHARE,
      contract: newSub as Contract,
      share: share as Share
    })
  })

  return NextResponse.json({ message: 'success', data: newSub }, { status: 201 })
}
