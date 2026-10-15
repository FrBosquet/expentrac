import 'server-only'
import { prisma, type Prisma } from '@lib/prisma'
import { ApiError } from './errors'

// No startup/build probe and no cached success: guard actual authenticated work.
export async function assertDatabaseReady(
  db: Prisma.TransactionClient = prisma
) {
  let ready = false
  try {
    const rows = await db.$queryRaw<Array<{ ready: boolean }>>`
      SELECT (
        (SELECT count(*) = 2 FROM information_schema.columns
         WHERE table_schema = 'public' AND data_type = 'integer'
           AND (table_name, column_name) IN (('Contract','fee'), ('Period','fee')))
        AND to_regclass('public."EmailOutbox"') IS NOT NULL
        AND to_regclass('public."InvitationEvent"') IS NOT NULL
      ) AS ready`
    ready = rows[0]?.ready === true
  } catch {
    /* A missing/partly migrated schema is unavailable, never guessed. */
  }
  if (!ready)
    throw new ApiError(
      503,
      'Service is temporarily unavailable for maintenance'
    )
}
