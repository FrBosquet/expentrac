import { authOptions } from '@lib/auth'
import { subscriptionInclude } from '@lib/contract'
import { prisma } from '@lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      {
        message: 'forbidden'
      },
      {
        status: 401
      }
    )
  }

  const id = params.id

  if (!id) {
    return NextResponse.json(
      {
        message: 'id is required'
      },
      {
        status: 400
      }
    )
  }

  const contract = await prisma.contract.findUnique({ where: { id } })

  if (!contract) {
    return NextResponse.json(
      {
        message: 'resource not found'
      },
      {
        status: 404
      }
    )
  }

  if (session.user.id !== contract?.userId) {
    return NextResponse.json(
      {
        message: 'user does not own this resource'
      },
      {
        status: 403
      }
    )
  }

  await prisma.contract.delete({ where: { id } })

  return NextResponse.json(
    { message: 'DELETED', data: { id: contract.id } },
    { status: 200 }
  )
}

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      {
        message: 'forbidden'
      },
      {
        status: 401
      }
    )
  }

  const id = params.id

  if (!id) {
    return NextResponse.json(
      {
        message: 'id is required'
      },
      {
        status: 400
      }
    )
  }

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: subscriptionInclude
  })

  if (!contract) {
    return NextResponse.json(
      {
        message: 'resource not found'
      },
      {
        status: 404
      }
    )
  }

  if (
    session.user.id !== contract?.userId &&
    !contract.shares.find((share) => {
      return share.toId === session.user.id && share.accepted === true
    })
  ) {
    return NextResponse.json(
      {
        message: 'user does not own this resource'
      },
      {
        status: 403
      }
    )
  }

  return NextResponse.json({ message: 'OK', data: contract }, { status: 200 })
}
