import { type User } from '@prisma/client'
import { emailSdk } from '@services/email'
import { prisma } from '@services/prisma'
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

export enum NOTIFICATION_TYPE {
  GENERIC = 'GENERIC',
}

export const POST = async (req: Request) => {
  const body = await req.json() as { userId: string, message: string, email: boolean, type: NOTIFICATION_TYPE }
  const { userId, message, email } = body
  const type = body.type || 'GENERIC'

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
    const notification = await prisma.notification.create({
      data: {
        user: {
          connect: { id: userId }
        },
        message: body.message,
        type,
        ack: false,
        date: new Date().toISOString()
      }
    })

    if (email) {
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        }
      }) as User

      await emailSdk.sendGenericEmail(user.email as string, user.name as string, message)
    }

    return NextResponse.json({ message: 'success', data: notification }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ message: 'error', data: e }, { status: 500 })
  }
}
