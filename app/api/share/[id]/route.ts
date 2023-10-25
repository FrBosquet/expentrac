import { authOptions } from '@lib/auth'
import { notificationSdk } from '@lib/notification'
import { prisma, type Contract } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

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

export const PATCH = async (req: Request, { params }: { params: { id: string } }) => {
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

  const share = await prisma.share.findUnique({ where: { id }, include })

  if (!share) {
    return NextResponse.json({
      message: 'share not found'
    }, {
      status: 404
    })
  }

  const body: { accepted: boolean } = await req.json()
  const { accepted } = body

  const updatedShare = await prisma.share.update({ where: { id }, data: { accepted }, include })

  await notificationSdk.create(
    share.fromId,
    true,
    {
      type: accepted ? NOTIFICATION_TYPE.LOAN_SHARE_ACCEPTED : NOTIFICATION_TYPE.LOAN_SHARE_REJECTED,
      contract: share.contract as Contract
    }
  )

  return NextResponse.json({ message: 'Updated', data: updatedShare }, { status: 200 })
}
