import { authOptions } from '@lib/auth'
import { prisma } from '@lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const DELETE = async (req: Request, { params }: { params: { id: string } }) => {
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

  const loan = await prisma.contract.findUnique({ where: { id } })

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

  await prisma.contract.delete({ where: { id } })

  return NextResponse.json({ message: 'DELETED', data: loan }, { status: 200 })
}
