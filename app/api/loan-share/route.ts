import { authOptions } from '@services/auth'
import { prisma } from '@services/prisma'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

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
