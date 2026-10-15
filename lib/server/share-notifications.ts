import { type Prisma } from '@lib/prisma'
import { NOTIFICATION_TYPE, SHARE_STATE } from '@types'

// Must run inside the transaction that confirms the invitation response.
export async function acknowledgeShareInvitations(
  db: Prisma.TransactionClient,
  userId: string,
  shareId: string,
  accepted: boolean
) {
  const invitations = await db.notification.findMany({
    where: {
      userId,
      ack: false,
      type: { in: [NOTIFICATION_TYPE.LOAN_SHARE, NOTIFICATION_TYPE.SUB_SHARE] }
    },
    select: { id: true, payload: true }
  })
  for (const invitation of invitations) {
    let payload: unknown
    try {
      payload =
        typeof invitation.payload === 'string'
          ? JSON.parse(invitation.payload)
          : invitation.payload
    } catch {
      continue
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
      continue
    const share = (payload as { share?: { id?: unknown } }).share
    if (share?.id !== shareId) continue
    await db.notification.update({
      where: { id: invitation.id },
      data: {
        ack: true,
        payload: JSON.stringify({
          ...payload,
          state: accepted ? SHARE_STATE.ACCEPTED : SHARE_STATE.REJECTED
        })
      }
    })
  }
}
