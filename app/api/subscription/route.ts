import { SELECT_OPTIONS } from "@components/Select"
import { Prisma, Subscription } from "@prisma/client"
import { authOptions } from "@services/auth"
import { prisma } from "@services/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

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
        name: 'asc',
      }
    ],
    include: {
      vendor: { include: { provider: true } },
      platform: { include: { provider: true } },
    }
  })

  return NextResponse.json(subs)
}

const parseBody = <T>(body: Record<string, string>, isCreate?: boolean) => {
  return Object.entries(body).reduce((acc, [key, value]) => {
    let parsedValue: any = value
    let parsedKey = key

    switch (key) {
      case 'fee':
        parsedValue = Number(value)
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

  const newSub = await prisma.subscription.create({
    data: {
      ...parseBody<Omit<Subscription, 'userId' | 'vendorId' | 'platformId'>>(body, true),
      user: {
        connect: {
          id: userId
        }
      }
    },
    include: {
      vendor: { include: { provider: true } },
      platform: { include: { provider: true } },
    }
  })

  return NextResponse.json({ message: 'success', data: newSub }, { status: 201 })
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
    include: {
      vendor: { include: { provider: true } },
      platform: { include: { provider: true } },
    }
  }

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