import { apiResponse } from '@lib/server/api'
import { readNotifications } from '@lib/server/reads'

export const GET = (req: Request) => apiResponse(() => readNotifications(req))
