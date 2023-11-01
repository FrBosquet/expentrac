import { authOptions } from '@lib/auth'
import { type LoanFormData } from '@lib/loan'
import { notificationSdk } from '@lib/notification'
import { prisma, type Contract, type Prisma, type RawProvidersOnContract, type Share } from '@lib/prisma'
import { PROVIDER_TYPE } from '@lib/provider'
import { NOTIFICATION_TYPE, SELECT_OPTIONS } from '@types'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { include } from '../include'
interface Query {
  params: {
    id: string
  }
}

export const PATCH = async (req: Request, { params }: Query) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({
      message: 'forbidden'
    }, {
      status: 403
    })
  }

  const id = params.id

  if (!id) {
    return NextResponse.json({
      message: 'id is required'
    }, {
      status: 400
    })
  }

  const userId = session.user.id

  const body = await req.json() as LoanFormData

  const loan = await prisma.contract.findUnique({ where: { id }, include })

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
  const sharedWithKeys = Object.entries(body).filter(([key]) => key.startsWith('sharedWith')).map(([_, value]) => value)
  const keysToDelete = loan.shares.filter(share => !sharedWithKeys.includes(share.toId)).map(share => ({ id: share.id }))
  const keysToCreate = sharedWithKeys.filter(id => !loan.shares.some(share => share.toId === id))

  const updatedLoan = await prisma.contract.update({
    where: {
      id
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

    void notificationSdk.create(share.toId, true, {
      type: NOTIFICATION_TYPE.LOAN_SHARE,
      contract: updatedLoan as Contract,
      share: share as Share
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
