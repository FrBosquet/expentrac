import { prisma } from '@lib/prisma'
import { NextResponse } from 'next/server'

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)

  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: searchParams.get('search') ?? ''
      }
    },
    orderBy: [
      {
        email: 'asc'
      }
    ]
  })

  return NextResponse.json(users)
}
