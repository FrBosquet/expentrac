import { apiResponse } from '@lib/server/api'
import { readProviderRelations } from '@lib/server/reads'

export const GET = (req: Request) =>
  apiResponse(() => readProviderRelations(req))
