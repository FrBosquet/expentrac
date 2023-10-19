import { authOptions } from '@lib/auth'
import { type LoanFormData } from '@lib/loan'
import { notificationSdk } from '@lib/notification'
import { prisma, type Loan, type Prisma, type RawProvidersOnContract } from '@lib/prisma'
import { PROVIDER_TYPE } from '@lib/provider'
import { CONTRACT_TYPE } from '@sdk/contract'
import { NOTIFICATION_TYPE, SELECT_OPTIONS, type LoanComplete } from '@types'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

const include = {
  vendor: { include: { provider: true } },
  platform: { include: { provider: true } },
  lender: { include: { provider: true } },
  shares: {
    include: { user: true }
  },
  user: true
}

const contractInclude = {
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
    include: contractInclude
  })

  return NextResponse.json(loans)
}

const parseBody = <T>(body: Record<string, string>, isCreate?: boolean) => {
  return Object.entries(body).reduce((acc, [key, value]) => {
    let parsedValue: any = value
    let parsedKey = key

    if (key.startsWith('sharedWith')) return acc

    switch (key) {
      case 'fee':
      case 'initial':
        parsedValue = Number(value)
        break
      case 'startDate':
      case 'endDate':
        parsedValue = new Date(value).toISOString()
        break
      case 'vendorId':
      case 'platformId':
      case 'lenderId':
        if (value === SELECT_OPTIONS.CREATE) return acc
        if (isCreate && value === SELECT_OPTIONS.NONE) return acc

        parsedKey = key.slice(0, -2)

        if (value === SELECT_OPTIONS.NONE) {
          parsedValue = {
            disconnect: true
          }
        } else {
          parsedValue = {
            connect: {
              id: value
            }
          }
        }

        break
    }

    return {
      ...acc,
      [parsedKey]: parsedValue
    }
  }, {}) as T
}

const addShares = async (loan: LoanComplete, body: Record<string, string>) => {
  for (const key in body) {
    if (key.startsWith('sharedWith')) {
      const userId = body[key]

      if (loan.shares.some(share => share.user.id === userId)) continue

      const loanShare = await prisma.loanShare.create({
        data: {
          user: {
            connect: {
              id: body[key]
            }
          },
          loan: {
            connect: {
              id: loan.id
            }
          }
        },
        include: {
          user: true
        }
      })

      await notificationSdk.createNotification(userId, true, {
        type: NOTIFICATION_TYPE.LOAN_SHARE,
        loan,
        loanShare
      })
    }
  }
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

  const args: Prisma.LoanCreateArgs = {
    data: {
      ...parseBody<Omit<Loan, 'userId' | 'lenderId' | 'vendorId' | 'platformId'>>(body, true),
      user: {
        connect: {
          id: userId
        }
      }
    },
    include
  }

  const newLoan = await prisma.loan.create(args)

  await addShares(newLoan as LoanComplete, body)

  const data = await prisma.loan.findFirst({
    where: { id: newLoan.id },
    include
  })

  return NextResponse.json({ message: 'success', data }, { status: 201 })
}

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

  const body = await req.json() as LoanFormData & { id: string } // TODO: Use here the LoanFormData defined in loan/form.tsx. Update it so it all strings, as HTMLForm is

  const loan = await prisma.contract.findUnique({ where: { id: body.id }, include: contractInclude })

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

  // TODO: PROVIDERS
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
    include: contractInclude
  })

  return NextResponse.json({ message: 'success', data: updatedLoan }, { status: 200 })
}

export const DELETE = async (req: Request) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({
      message: 'forbidden'
    }, {
      status: 403
    })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({
      message: 'id is required'
    }, {
      status: 400
    })
  }

  const loan = await prisma.loan.findUnique({ where: { id } })

  if (!loan) {
    return NextResponse.json({
      message: 'loan not found'
    }, {
      status: 404
    })
  }

  if (session.user.id !== loan?.userId) {
    return NextResponse.json({
      message: 'user does not own this resource'
    }, {
      status: 403
    })
  }

  await prisma.loan.delete({ where: { id } })

  return NextResponse.json({ message: 'DELETED' }, { status: 200 })
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
