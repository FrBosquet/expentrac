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
