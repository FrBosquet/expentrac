import { Loan } from "@prisma/client"
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

  const loans = await prisma.loan.findMany({
    where: { userId },
    orderBy: [
      { startDate: 'desc' },
      {
        name: 'asc',
      }
    ]
  })

  return NextResponse.json(loans)
}

const parseBody = <T>(body: Record<string, string>) => {
  return Object.entries(body).reduce((acc, [key, value]) => {
    let parsedValue: any = value

    switch (key) {
      case 'fee':
        parsedValue = Number(value)
        break
      case 'startDate':
      case 'endDate':
        parsedValue = new Date(value).toISOString()
        break
    }

    return {
      ...acc,
      [key]: parsedValue
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

  const newLoan = await prisma.loan.create({
    data: {
      ...parseBody<Omit<Loan, 'userId'>>(body),
      user: {
        connect: {
          id: userId
        }
      }
    }
  })

  return NextResponse.json({ message: 'success', data: newLoan }, { status: 201 })
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
  const loan = await prisma.loan.findUnique({ where: { id: body.id } })

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

  const updatedLoan = await prisma.loan.update({
    data: parseBody<Loan>(body),
    where: {
      id: body.id
    }
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