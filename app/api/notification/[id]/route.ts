import { authOptions } from '@lib/auth'
import { prisma, type Prisma } from '@lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const PATCH = async (req: Request, { params }: { params: { id: string } }) => {
  const id = params.id
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
  const notification = await prisma.notification.findUnique({ where: { id } })

  if (!notification) {
    return NextResponse.json({
      message: 'loan not found'
    }, {
      status: 404
    })
  }

  if (userId !== notification.userId) {
    return NextResponse.json({
      message: 'user does not own this resource'
    }, {
      status: 403
    })
  }

  const args: Prisma.NotificationUpdateArgs = {
    data: {
      ack: body.ack,
      payload: JSON.stringify({
        ...JSON.parse(notification.payload as string),
        state: body.state
      })
    },
    where: {
      id
    }
  }

  const updatedNotification = await prisma.notification.update(args)

  return NextResponse.json({ message: 'success', notification: updatedNotification }, { status: 200 })
}
