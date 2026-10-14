import { authOptions } from '@lib/auth'
import { fetchBrandInfo } from '@lib/brandfetch'
import { prisma } from '@lib/prisma'
import { apiResponse, requireUser } from '@lib/server/api'
import { pageOptions } from '@lib/server/pagination'
import { identifier, jsonObject, text } from '@lib/server/validation'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const handlePOST = async (req: Request) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      {
        message: 'unauthorized'
      },
      {
        status: 401
      }
    )
  }

  const raw = await jsonObject(req)
  const body = {
    brandId: identifier(raw.brandId),
    name: text(raw.name, 'name'),
    domain: text(raw.domain, 'domain', 253)
  }
  if (
    !/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(
      body.domain
    )
  )
    return NextResponse.json({ message: 'Invalid domain' }, { status: 400 })

  let data = await prisma.provider.findUnique({
    where: {
      id: body.brandId
    }
  })

  if (!data) {
    const rawContent = await fetchBrandInfo(body.domain)

    data = await prisma.provider.create({
      data: {
        id: body.brandId,
        name: body.name,
        isFetched: true,
        rawContent: rawContent as any
      }
    })
  }

  return NextResponse.json({ message: 'success', data }, { status: 201 })
}

export const POST = (req: Request) => apiResponse(() => handlePOST(req))

export const GET = (req: Request) =>
  apiResponse(async () => {
    await requireUser(req)
    return prisma.provider.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      ...pageOptions(req)
    })
  })
