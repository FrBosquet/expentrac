import { prisma } from '@lib/prisma'
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

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      {
        message: 'userId is required'
      },
      {
        status: 400
      }
    )
  }

  const shares = await prisma.share.findMany({
    where: {
      toId: userId
    },
    include
  })

  return NextResponse.json(shares)
}
