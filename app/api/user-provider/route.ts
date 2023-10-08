import { type Brand } from '@components/BrandAutocomplete'
import { authOptions } from '@lib/auth'
import { fetchBrandInfo } from '@lib/brandfetch'
import { prisma } from '@lib/prisma'
import { getServerSession } from 'next-auth/next'
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

  const providers = await prisma.userProvider.findMany({
    where: { userId },
    orderBy: [
      {
        provider: {
          name: 'asc'
        }
      }
    ],
    include: {
      provider: true
    }
  })

  return NextResponse.json(providers)
}

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({
      message: 'unauthorized'
    }, {
      status: 400
    })
  }

  const userId = session.user.id
  const body = await req.json() as Brand

  let extendedData

  const existingProviderInfo = await prisma.provider.findUnique({
    where: {
      id: body.brandId
    }
  })

  if (!existingProviderInfo) {
    extendedData = await fetchBrandInfo(body.domain)
  } else {
    extendedData = existingProviderInfo.rawContent
  }

  const data = await prisma.userProvider.create({
    data: {
      provider: {
        connectOrCreate: {
          where: {
            id: body.brandId
          },
          create: {
            id: body.brandId,
            name: body.name,
            isFetched: true,
            rawContent: extendedData as any
          }
        }
      },
      user: {
        connect: {
          id: userId
        }
      }
    },
    include: {
      provider: true
    }
  })

  return NextResponse.json({ message: 'success', data }, { status: 201 })
}

export const DELETE = async (req: Request) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({
      message: 'forbidden'
    }, {
      status: 403
    })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({
      message: 'id is required'
    }, {
      status: 400
    })
  }

  const userProvider = await prisma.userProvider.findUnique({ where: { id } })

  if (userProvider == null) {
    return NextResponse.json({
      message: 'user provider not found'
    }, {
      status: 404
    })
  }

  if (session.user.id !== userProvider?.userId) {
    return NextResponse.json({
      message: 'user does not own this resource'
    }, {
      status: 403
    })
  }

  await prisma.userProvider.delete({ where: { id } })

  return NextResponse.json({ message: 'DELETED' }, { status: 200 })
}
