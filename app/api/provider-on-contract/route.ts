import { prisma } from '@lib/prisma'
import { NextResponse } from 'next/server'

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

  const loans = await prisma.providersOnContract.findMany({
    where: {
      contract: {
        userId
      }
    },
    orderBy: [
      {
        provider: {
          name: 'asc'
        }
      }
    ],
    include: {
      provider: true,
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
  })

  return NextResponse.json(loans)
}
