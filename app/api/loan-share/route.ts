import { authOptions } from '@lib/auth'
import { emailSdk } from '@lib/email'
import { prisma, type Prisma } from '@lib/prisma'
import { type LoanShareComplete } from '@types'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

const include = {
  user: true,
  loan: {
    include: {
      user: true,
      vendor: { include: { provider: true } },
      platform: { include: { provider: true } },
      lender: { include: { provider: true } },
      shares: {
        include: {
          user: true
        }
      }
    }
  }
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

  const loanShares = await prisma.loanShare.findMany({
    where: { userId },
    include
  })

  return NextResponse.json(loanShares)
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
  const share = await prisma.loanShare.findUnique({ where: { id: body.id } })

  if (!share) {
    return NextResponse.json({
      message: 'share not found'
    }, {
      status: 404
    })
  }

  if (userId !== share?.userId) {
    return NextResponse.json({
      message: 'user does not own this resource'
    }, {
      status: 403
    })
  }

  const args: Prisma.LoanShareUpdateArgs = {
    data: {
      accepted: body.accepted
    },
    where: {
      id: body.id
    },
    include
  }

  const updatedShare = await prisma.loanShare.update(args) as LoanShareComplete

  const { loan, user: { name } } = updatedShare

  if (updatedShare.accepted) {
    await emailSdk.sendLoanShareAcceptance(
      name as string,
      loan
    )
  } else {
    await emailSdk.sendLoanShareRejection(
      name as string,
      loan
    )
  }

  return NextResponse.json({ message: 'success', data: updatedShare }, { status: 200 })
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

  const loanShare = await prisma.loanShare.findUnique({
    where: { id },
    include: {
      loan: true
    }
  })

  if (!loanShare) {
    return NextResponse.json({
      message: 'loanShare not found'
    }, {
      status: 404
    })
  }

  if (session.user.id !== loanShare.loan.userId) {
    return NextResponse.json({
      message: 'user does not own this resource'
    }, {
      status: 403
    })
  }

  await prisma.loanShare.delete({ where: { id } })

  return NextResponse.json({ message: 'DELETED' }, { status: 200 })
}
