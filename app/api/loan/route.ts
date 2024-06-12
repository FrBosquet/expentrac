import { authOptions } from '@lib/auth'
import { CONTRACT_TYPE } from '@lib/contract'
import { notificationSdk } from '@lib/notification'
import { type Contract, type Prisma, prisma, type Share } from '@lib/prisma'
import { PROVIDER_TYPE } from '@lib/provider'
import { NOTIFICATION_TYPE, SELECT_OPTIONS } from '@types'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { include } from './include'

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      {
        message: 'userId is required'
      },
      {
        status: 400
      }
    )
  }

  const loans = await prisma.contract.findMany({
    where: {
      userId,
      type: CONTRACT_TYPE.LOAN
    },
    orderBy: [
      {
        name: 'asc'
      }
    ],
    include
  })

  return NextResponse.json(loans)
}

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      {
        message: 'userId is required'
      },
      {
        status: 400
      }
    )
  }

  const userId = session.user.id

  const body = await req.json()

  const keysToCreate = Object.entries(body)
    .filter(([key]) => key.startsWith('sharedWith'))
    .map(([_, value]) => value as string)

  const newLoan = await prisma.contract.create({
    data: {
      user: {
        connect: {
          id: userId
        }
      },
      type: CONTRACT_TYPE.LOAN,
      name: body.name,
      fee: Number(body.initial),
      periods: {
        create: {
          to: new Date(body.endDate).toISOString(),
          from: new Date(body.startDate).toISOString(),
          fee: Number(body.fee),
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

  newLoan.shares.forEach((share) => {
    void notificationSdk.create(share.toId, true, {
      type: NOTIFICATION_TYPE.LOAN_SHARE,
      contract: newLoan as Contract,
      share: share as Share
    })
  })

  return NextResponse.json(
    { message: 'success', data: newLoan },
    { status: 201 }
  )
}
