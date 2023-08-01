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
    ]
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

  const newSub = await prisma.subscription.create({
    data: {
      ...body,
      fee: Number(body.fee),
      user: {
        connect: {
          id: userId
        }
      }
    }
  })

  return NextResponse.json({ message: 'POST', data: newSub }, { status: 201 })
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