import { notificationSdk } from '@lib/notification'
import { prisma } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'
import { NextResponse } from 'next/server'

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

  const loans = await prisma.notification.findMany({
    orderBy: [
      { date: 'desc' }
    ],
    where: {
      userId,
      ack: false || undefined
    }
  })

  return NextResponse.json(loans)
}

export const POST = async (req: Request) => {
  const body = await req.json() as { userId: string, message: string, email: boolean, type: NOTIFICATION_TYPE }
  const { userId, message, email } = body

  if (!userId) {
    return NextResponse.json({
      message: 'userId is required'
    }, {
      status: 400
    })
  }

  if (!message) {
    return NextResponse.json({
      message: 'message is required'
    }, {
      status: 400
    })
  }

  try {
    const notification = await notificationSdk.create(userId, email, {
      type: NOTIFICATION_TYPE.GENERIC,
      message: body.message
    })

    return NextResponse.json({ message: 'success', data: notification }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ message: 'error', data: e }, { status: 500 })
  }
}
