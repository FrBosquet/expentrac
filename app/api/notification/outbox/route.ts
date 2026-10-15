import { ApiError, apiResponse } from '@lib/server/api'
import { deliverOutbox } from '@lib/server/outbox'

export const maxDuration = 60
export const GET = (req: Request) =>
  apiResponse(async () => {
    const secret = process.env.CRON_SECRET
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`)
      throw new ApiError(401, 'Unauthorized')
    return deliverOutbox()
  })
