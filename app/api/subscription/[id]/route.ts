/* eslint-disable @typescript-eslint/indent */
import { authOptions } from '@lib/auth'
import { notificationSdk } from '@lib/notification'
import { prisma, type Contract, type Prisma, type RawProvidersOnContract, type Share } from '@lib/prisma'
import { PROVIDER_TYPE } from '@lib/provider'
import { type SubFormData } from '@lib/sub'
import { NOTIFICATION_TYPE, SELECT_OPTIONS } from '@types'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { include } from '../include'

interface Query {
  params: {
    id: string
  }
}

// TODO: This looks almost exactly the same as loan patch. Can we combine them into Contract?
// Only difference is the Lender and that means nothing in terms of DB structure. Just using the patch from loan should work almost OOB
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

  const body = await req.json() as SubFormData

  const sub = await prisma.contract.findUnique({ where: { id }, include })

  if (!sub) {
    return NextResponse.json({
      message: 'sub not found'
    }, {
      status: 404
    })
  }

  if (userId !== sub?.userId) {
    return NextResponse.json({
      message: 'user does not own this resource'
    }, {
      status: 403
    })
  }

  // SHARES
  const sharedWithKeys = Object.entries(body).filter(([key]) => key.startsWith('sharedWith')).map(([_, value]) => value as string)
  const keysToDelete = sub.shares.filter(share => !sharedWithKeys.includes(share.toId)).map(share => ({ id: share.id }))
  const keysToCreate = sharedWithKeys.filter(id => !sub.shares.some(share => share.toId === id))

  const updatedSub = await prisma.contract.update({
    where: {
      id
    },
    data: {
      name: body.name,
      fee: Number(body.initial),
      periods: {
        updateMany: {
          where: {
            id: sub.periods[0].id
          },
          data: {
            fee: Number(body.fee),
            payday: body.payday ? Number(body.payday) : undefined,
            paymonth: body.paymonth ? Number(body.paymonth) : undefined,
            periodicity: body.periodicity
          }
        }
      },
      providers: getProviderUpdateArgs(sub, body),
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
      resources: sub.resources.length === 0
        // THIS IS A FIX FOR THE CARRYOVER OF SUBSCRIPTIONS TO CONTRACTS NOT HAVING LINKS
        ? {
          create: {
            name: 'link',
            type: 'LINK',
            url: body.link
          }
        }
        : {
          upsert: {
            where: {
              id: sub.resources.find(resource => resource.type === 'LINK')?.id,
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
    const share = updatedSub.shares.find(share => share.toId === toId)

    if (!share) return

    void notificationSdk.create(share.toId, true, {
      type: NOTIFICATION_TYPE.SUB_SHARE,
      contract: updatedSub as Contract,
      share: share as Share
    })
  })

  return NextResponse.json({ message: 'success', data: updatedSub }, { status: 200 })
}

const getProviderUpdateArgs = (sub: { providers: RawProvidersOnContract[] }, body: SubFormData) => {
  const vendorProvider = sub.providers.find(provider => provider.as === PROVIDER_TYPE.VENDOR)
  const platformProvider = sub.providers.find(provider => provider.as === PROVIDER_TYPE.PLATFORM)

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
