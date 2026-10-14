import { prisma } from '@lib/prisma'
import { apiResponse, requireUser } from '@lib/server/api'
import { jsonObject, text } from '@lib/server/validation'

const select = {
  id: true,
  name: true,
  email: true,
  image: true,
  occupation: true
}
export const GET = (req: Request) =>
  apiResponse(async () =>
    prisma.user.findUniqueOrThrow({
      where: { id: await requireUser(req) },
      select
    })
  )
export const PATCH = (req: Request) =>
  apiResponse(async () => {
    const id = await requireUser(req)
    const body = await jsonObject(req)
    const data = await prisma.user.update({
      where: { id },
      data: {
        name: text(body.name, 'name'),
        occupation: body.occupation ? text(body.occupation, 'occupation') : ''
      },
      select
    })
    return { data }
  })
