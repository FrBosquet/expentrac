import { eurosToCents } from '@lib/money'
import { CONTRACT_TYPE, subscriptionInclude } from '@lib/contract'
import { prisma } from '@lib/prisma'
import { ApiError, apiResponse, requireUser } from '@lib/server/api'
import {
  amount,
  dateInput,
  identifier,
  integer,
  jsonObject,
  text
} from '@lib/server/validation'

export const POST = (req: Request) =>
  apiResponse(async () => {
    const userId = await requireUser(req)
    const body = await jsonObject(req)
    const employer = identifier(body.employer)
    if (
      !(await prisma.provider.findUnique({
        where: { id: employer },
        select: { id: true }
      }))
    )
      throw new ApiError(400, 'Unknown employer')
    const data = await prisma.contract.create({
      data: {
        userId,
        type: CONTRACT_TYPE.WORK,
        name: text(body.name, 'name'),
        periods: {
          create: {
            from: dateInput(body.start),
            feeCents: eurosToCents(amount(body.salary)),
            payday: integer(body.payday, 'payday', 1, 31)
          }
        },
        providers: { create: { providerId: employer, as: 'EMPLOYER' } }
      },
      include: subscriptionInclude
    })
    return { data }
  })
