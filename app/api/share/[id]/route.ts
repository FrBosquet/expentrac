import { authOptions } from '@lib/auth'
import { CONTRACT_TYPE } from '@lib/contract'
import { notificationSdk } from '@lib/notification'
import { type Contract, prisma } from '@lib/prisma'
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

export const PATCH = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      {
        message: 'forbidden'
      },
      {
        status: 403
      }
    )
  }

  const userId = session.user.id

  const id = params.id

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

  const body: { accepted: boolean } = await req.json()
  const { accepted } = body

  const updatedShare = await prisma.share.update({
    where: { id },
    data: { accepted },
    include
  })

  await notificationSdk.create(userId, true, {
    type: getType(share.contract.type, accepted),
    contract: share.contract as Contract
  })

  return NextResponse.json(
    { message: 'Updated', data: updatedShare },
    { status: 200 }
  )
}
