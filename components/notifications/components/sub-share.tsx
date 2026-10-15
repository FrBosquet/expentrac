import { useSub } from '@components/subscription/context'
import { SubscriptionDetail } from '@components/subscription/detail'
import { useShareWrite } from '@hooks/resources'
import { euroFormatter } from '@lib/currency'
import { type Notification as NotificationType, type Share } from '@lib/models'
import { type SubShareNotificationPayload } from '@lib/notification/sub-share'
import { unwrapSub } from '@lib/sub'
import { NOTIFICATION_TYPE, type NotificationBase, SHARE_STATE } from '@types'
import Link from 'next/link'
import { type ReactNode } from 'react'

import { NotificationWrapper } from './wrapper'

export type NotificationSubShare = NotificationBase & {
  type: NOTIFICATION_TYPE.SUB_SHARE
  meta: Share
}

export const getSubShareNotification = (
  share: Share
): NotificationSubShare => ({
  type: NOTIFICATION_TYPE.SUB_SHARE,
  meta: share,
  ack: share.accepted !== null,
  createdAt: new Date(share.createdAt)
})

const Content = ({
  payload
}: {
  payload: SubShareNotificationPayload
}): ReactNode => {
  const { preview, state } = payload
  if (!preview) return <p>This invitation is unavailable.</p>
  return (
    <p>
      <strong>{preview.owner.name}</strong>{' '}
      {state === SHARE_STATE.ACCEPTED
        ? 'shared'
        : state === SHARE_STATE.REJECTED
          ? 'offered to share'
          : 'wants to share'}{' '}
      {state === SHARE_STATE.ACCEPTED ? (
        <Link href={`/dashboard/subscriptions/${preview.id}`}>
          {preview.name}
        </Link>
      ) : (
        <strong>{preview.name}</strong>
      )}{' '}
      with you ({euroFormatter.format(preview.monthlyAmount)}/month).
    </p>
  )
}

export const SubShareNotification = ({
  notification
}: {
  notification: NotificationType
}) => {
  const respond = useShareWrite()

  const { id, ack, createdAt } = notification
  const payload = JSON.parse(
    notification.payload as string
  ) as SubShareNotificationPayload

  const handleResponse = async (accepted: boolean) => {
    try {
      await respond.mutateAsync({ id: payload.share.id, accepted })
    } catch {
      /* Keep the invitation available for retry; mutation exposes the error. */
    }
  }

  return (
    <NotificationWrapper
      key={id}
      accept={() => {
        void handleResponse(true)
      }}
      acknowledged={ack}
      date={createdAt}
      loading={respond.isPending}
      reject={() => {
        void handleResponse(false)
      }}
    >
      <Content payload={payload} />
      {respond.isError && <p role="alert">{respond.error.message}</p>}
    </NotificationWrapper>
  )
}
