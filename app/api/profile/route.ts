import { readProfile, profileSelect } from '@lib/server/reads'
import { prisma } from '@lib/prisma'
import { apiResponse, requireUser } from '@lib/server/api'
import { jsonObject, text } from '@lib/server/validation'

export const GET = (req: Request) => apiResponse(() => readProfile(req))
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
      select: profileSelect
    })
    return { data }
  })
