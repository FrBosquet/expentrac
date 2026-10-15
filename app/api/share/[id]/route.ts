import { authOptions } from '@lib/auth'
import { CONTRACT_TYPE } from '@lib/contract'
import { notificationSdk, deliverNotifications } from '@lib/notification'
import { type Contract, prisma } from '@lib/prisma'
import { apiResponse, ApiError } from '@lib/server/api'
import { NOTIFICATION_TYPE } from '@types'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const include = {
  to: true,
  from: true,
  contract: {
    include: {
      shares: {
        include: {
          to: true
        }
      },
      providers: {
        include: {
          provider: true
        }
      },
      user: true,
      resources: true,
      periods: true
    }
  }
}

const getType = (contractType: string, accepted: boolean) => {
  if (contractType === CONTRACT_TYPE.LOAN) {
    return accepted
      ? NOTIFICATION_TYPE.LOAN_SHARE_ACCEPTED
      : NOTIFICATION_TYPE.LOAN_SHARE_REJECTED
  } else if (contractType === CONTRACT_TYPE.SUBSCRIPTION) {
    return accepted
      ? NOTIFICATION_TYPE.SUB_SHARE_ACCEPTED
      : NOTIFICATION_TYPE.SUB_SHARE_REJECTED
  }

  throw new Error(
    `Invalid base type for share acceptance/rejection ${contractType}`
  )
}

const handlePATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

  const userId = session.user.id

  const { id } = await params

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

  const share = await prisma.share.findUnique({ where: { id }, include })

  if (!share) {
    return NextResponse.json(
      {
        message: 'share not found'
      },
      {
        status: 404
      }
    )
  }

  if (share.toId !== userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  let body: { accepted?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }
  if (!body || typeof body.accepted !== 'boolean') {
    return NextResponse.json(
      { message: 'accepted must be boolean' },
      { status: 400 }
    )
  }
  const { accepted } = body

  if (share.accepted === accepted) {
    return NextResponse.json({ message: 'Unchanged', data: share })
  }

  if (share.accepted !== null) {
    return NextResponse.json(
      { message: 'Invitation already answered' },
      { status: 409 }
    )
  }

  const notificationIds: string[] = []
  const updatedShare = await prisma.$transaction(
    async (db) => {
      const changed = await db.share.updateMany({
        where: { id, toId: userId, accepted: null },
        data: { accepted }
      })
      if (!changed.count)
        throw new ApiError(409, 'Invitation already answered or removed')
      const updated = await db.share.findUniqueOrThrow({
        where: { id },
        include
      })
      const notification = await notificationSdk.create(
        userId,
        true,
        {
          type: getType(updated.contract.type, accepted),
          contract: updated.contract as Contract
        },
        db
      )
      if (notification) notificationIds.push(notification.id)
      return updated
    },
    { isolationLevel: 'Serializable', timeout: 20000 }
  )
  await deliverNotifications(notificationIds)

  return NextResponse.json(
    { message: 'Updated', data: updatedShare },
    { status: 200 }
  )
}

export const PATCH = (
  req: Request,
  query: { params: Promise<{ id: string }> }
) => apiResponse(() => handlePATCH(req, query))
