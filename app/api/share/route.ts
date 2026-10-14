import { apiResponse } from '@lib/server/api'
import { readShares } from '@lib/server/reads'

export const GET = (req: Request) => apiResponse(() => readShares(req))
