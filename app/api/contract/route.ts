import { apiResponse } from '@lib/server/api'
import { readContracts } from '@lib/server/reads'

export const GET = (req: Request) => apiResponse(() => readContracts(req))
