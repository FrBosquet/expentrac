import { prisma } from '@lib/prisma'
import { ApiError, apiResponse, requireUser } from '@lib/server/api'

export const GET = (req: Request) =>
  apiResponse(async () => {
    const userId = await requireUser(req)
    const search = new URL(req.url).searchParams.get('search')?.trim() ?? ''
    if (search.length < 3 || search.length > 254)
      throw new ApiError(400, 'Search must contain 3–254 characters')
    return prisma.user.findMany({
      where: {
        id: { not: userId },
        email: { contains: search, mode: 'insensitive' }
      },
      select: { id: true, name: true, email: true, image: true },
      orderBy: { email: 'asc' },
      take: 20
    })
  })
