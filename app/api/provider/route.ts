import { type Brand } from '@components/BrandAutocomplete'
import { authOptions } from '@lib/auth'
import { fetchBrandInfo } from '@lib/brandfetch'
import { prisma } from '@lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      {
        message: 'unauthorized'
      },
      {
        status: 400
      }
    )
  }

  const body = (await req.json()) as Brand

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
