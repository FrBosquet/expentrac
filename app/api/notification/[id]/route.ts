import { authOptions } from '@lib/auth'
import { type Prisma, prisma } from '@lib/prisma'
import { ApiError, apiResponse } from '@lib/server/api'
import { jsonObject } from '@lib/server/validation'
import { SHARE_STATE } from '@types'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const handlePATCH = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const id = params.id
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      {
        message: 'userId is required'
      },
      {
        status: 401
      }
    )
  }

  const userId = session.user.id

  const body = await jsonObject(req)
  if (typeof body.ack !== 'boolean')
    throw new ApiError(400, 'ack must be boolean')
  if (
    body.state !== undefined &&
    !Object.values(SHARE_STATE).includes(body.state as SHARE_STATE)
  )
    throw new ApiError(400, 'Invalid notification state')
  const notification = await prisma.notification.findUnique({ where: { id } })

  if (!notification) {
    return NextResponse.json(
      {
        message: 'loan not found'
      },
      {
        status: 404
      }
    )
  }

  if (userId !== notification.userId) {
    return NextResponse.json(
      {
        message: 'user does not own this resource'
      },
      {
        status: 403
      }
    )
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

  return NextResponse.json(
    { message: 'success', notification: updatedNotification },
    { status: 200 }
  )
}

export const PATCH = (req: Request, query: { params: { id: string } }) =>
  apiResponse(() => handlePATCH(req, query))
