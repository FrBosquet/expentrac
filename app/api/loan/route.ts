import { authOptions } from '@lib/auth'
import { type LoanFormData } from '@lib/loan'
import { notificationSdk } from '@lib/notification'
import { prisma, type Prisma, type RawProvidersOnContract } from '@lib/prisma'
import { PROVIDER_TYPE } from '@lib/provider'
import { CONTRACT_TYPE, type Contract } from '@sdk/contract'
import { NOTIFICATION_TYPE, SELECT_OPTIONS } from '@types'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

const include = {
  shares: {
    include: {
      to: true
    }
  },
  providers: {
    include: {
      provider: true
    }
  },
  user: true,
  resources: true,
  periods: true
}

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
    return NextResponse.json({
      message: 'userId is required'
    }, {
      status: 400
    })
  }

  const userId = session.user.id

  const body = await req.json()

  // TODO: Create notifications with the sharedWith users. Also in the update
  const keysToCreate = Object.entries(body).filter(([key]) => key.startsWith('sharedWith')).map(([key, value]) => value as string)

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
          fee: Number(body.fee)
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

  newLoan.shares.forEach(share => {
    void notificationSdk.createNotification(share.toId, true, {
      type: NOTIFICATION_TYPE.LOAN_SHARE,
      loan: newLoan as Contract,
      loanShare: share
    })
  })

  return NextResponse.json({ message: 'success', data: newLoan }, { status: 201 })
}

// TODO: For consistency, this should be in loan/[id]/route.ts
export const PATCH = async (req: Request) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({
      message: 'userId is required'
    }, {
      status: 400
    })
  }

  const userId = session.user.id

  const body = await req.json() as LoanFormData & { id: string }

  const loan = await prisma.contract.findUnique({ where: { id: body.id }, include })

  if (!loan) {
    return NextResponse.json({
      message: 'loan not found'
    }, {
      status: 404
    })
  }

  if (userId !== loan?.userId) {
    return NextResponse.json({
      message: 'user does not own this resource'
    }, {
      status: 403
    })
  }

  // SHARES
  const sharedWithKeys = Object.entries(body).filter(([key]) => key.startsWith('sharedWith')).map(([key, value]) => value)
  const keysToDelete = loan.shares.filter(share => !sharedWithKeys.includes(share.toId)).map(share => ({ id: share.id }))
  const keysToCreate = sharedWithKeys.filter(id => !loan.shares.some(share => share.toId === id))

  const updatedLoan = await prisma.contract.update({
    where: {
      id: body.id
    },
    data: {
      name: body.name,
      fee: Number(body.initial),
      periods: {
        updateMany: {
          where: {
            id: loan.periods[0].id
          },
          data: {
            to: new Date(body.endDate).toISOString(),
            from: new Date(body.startDate).toISOString(),
            fee: Number(body.fee)
          }
        }
      },
      providers: getProviderUpdateArgs(loan, body),
      shares: {
        createMany: {
          data: keysToCreate.map(toId => ({
            fromId: userId,
            toId
          }))
        },
        deleteMany: {
          OR: keysToDelete
        }
      },
      resources: {
        upsert: {
          where: {
            id: loan.resources.find(resource => resource.type === 'LINK')?.id,
            type: 'LINK'
          },
          update: {
            url: body.link
          },
          create: {
            name: 'link',
            type: 'LINK',
            url: body.link
          }
        }
      }
    },
    include
  })

  keysToCreate.forEach(toId => {
    const share = updatedLoan.shares.find(share => share.toId === toId)

    if (!share) return

    void notificationSdk.createNotification(share.toId, true, {
      type: NOTIFICATION_TYPE.LOAN_SHARE,
      loan: updatedLoan as Contract,
      loanShare: share
    })
  })

  return NextResponse.json({ message: 'success', data: updatedLoan }, { status: 200 })
}

const getProviderUpdateArgs = (loan: { providers: RawProvidersOnContract[] }, body: LoanFormData) => {
  const vendorProvider = loan.providers.find(provider => provider.as === PROVIDER_TYPE.VENDOR)
  const platformProvider = loan.providers.find(provider => provider.as === PROVIDER_TYPE.PLATFORM)
  const lenderProvider = loan.providers.find(provider => provider.as === PROVIDER_TYPE.LENDER)

  const getUpdate = (providerOnContract: RawProvidersOnContract | undefined, providerId: string | undefined) => {
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
