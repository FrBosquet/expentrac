import { SELECT_OPTIONS } from '@components/Select'
import { type Prisma, type Subscription } from '@prisma/client'
import { authOptions } from '@services/auth'
import { prisma } from '@services/prisma'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

const include = {
  vendor: { include: { provider: true } },
  platform: { include: { provider: true } },
  shares: {
    include: { user: true }
  },
  user: true
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

  const subs = await prisma.subscription.findMany({
    where: { userId },
    orderBy: [
      {
        name: 'asc'
      }
    ],
    include
  })

  return NextResponse.json(subs)
}

const parseBody = <T>(body: Record<string, string>, isCreate?: boolean) => {
  return Object.entries(body).reduce((acc, [key, value]) => {
    let parsedValue: any = value
    let parsedKey = key

    if (key.startsWith('sharedWith')) return acc

    switch (key) {
      case 'fee':
        parsedValue = Number(value)
        break
      case 'yearly':
        parsedValue = value === 'on'
        break
      case 'payday':
        parsedValue = value === '0' ? null : Number(value)
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

const addShares = async (subscriptionId: string, body: Record<string, string>) => {
  for (const key in body) {
    if (key.startsWith('sharedWith')) {
      await prisma.subscriptionShare.create({
        data: {
          user: {
            connect: {
              id: body[key]
            }
          },
          subscription: {
            connect: {
              id: subscriptionId
            }
          }
        }
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

  const args: Prisma.SubscriptionCreateArgs = {
    data: {
      ...parseBody<Omit<Subscription, 'userId' | 'vendorId' | 'platformId'>>(body, true),
      user: {
        connect: {
          id: userId
        }
      }
    },
    include
  }

  const newSub = await prisma.subscription.create(args)

  await addShares(newSub.id, body)

  const data = await prisma.subscription.findFirst({
    where: { id: newSub.id },
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

  const body = await req.json()
  const subscription = await prisma.subscription.findUnique({ where: { id: body.id } })

  if (!subscription) {
    return NextResponse.json({
      message: 'subscription not found'
    }, {
      status: 404
    })
  }

  if (userId !== subscription?.userId) {
    return NextResponse.json({
      message: 'user does not own this resource'
    }, {
      status: 403
    })
  }

  const args: Prisma.SubscriptionUpdateArgs = {
    data: parseBody<Subscription>(body),
    where: {
      id: body.id
    },
    include
  }

  await addShares(body.id, body)

  const updatedsubscription = await prisma.subscription.update(args)

  return NextResponse.json({ message: 'success', data: updatedsubscription }, { status: 200 })
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

  const sub = await prisma.subscription.findUnique({ where: { id } })

  if (!sub) {
    return NextResponse.json({
      message: 'subscription not found'
    }, {
      status: 404
    })
  }

  if (session.user.id !== sub?.userId) {
    return NextResponse.json({
      message: 'user does not own this resource'
    }, {
      status: 403
    })
  }

  await prisma.subscription.delete({ where: { id } })

  return NextResponse.json({ message: 'DELETED' }, { status: 200 })
}
