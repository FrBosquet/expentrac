import { CONTRACT_TYPE } from '@lib/contract'
import { prisma } from '@lib/prisma'
import { NextResponse } from 'next/server'

const include = {
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

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const type = searchParams.get('type')

  if (type && !Object.values(CONTRACT_TYPE).includes(type as CONTRACT_TYPE)) {
    return NextResponse.json(
      {
        message: `invalid contract type ${type}`
      },
      {
        status: 400
      }
    )
  }

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

  const loans = await prisma.contract.findMany({
    where: {
      userId,
      type: undefined
    },
    orderBy: [
      {
        name: 'asc'
      }
    ],
    include
  })

  return NextResponse.json(loans)
}
