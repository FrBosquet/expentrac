import { useNotifications } from '@components/notifications/context'
import { useShares } from '@components/share/hooks'
import { useSub } from '@components/subscription/context'
import { SubscriptionDetail } from '@components/subscription/detail'
import { euroFormatter } from '@lib/currency'
import { type SubShareNotificationPayload } from '@lib/notification/sub-share'
import { type Notification as NotificationType, type Share } from '@lib/prisma'
import { unwrapSub } from '@lib/sub'
import { notificationSdk } from '@sdk/notifications'
import { shareSdk } from '@sdk/share'
import { NOTIFICATION_TYPE, type NotificationBase, SHARE_STATE } from '@types'
import { type ReactNode, useState } from 'react'

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
  const { contract, state } = payload

  const sub = unwrapSub(contract)

  const { sub: cachedSub } = useSub(sub.id)

  const { user } = sub

  switch (state) {
    case SHARE_STATE.ACCEPTED:
      return (
        <p className="w-full">
          You accepted the share request for{' '}
          <SubscriptionDetail
            className="font-semibold text-expentrac-800"
            sub={cachedSub ?? sub}
          />{' '}
          by <strong>{user.name}</strong>
        </p>
      )
    case SHARE_STATE.REJECTED:
      return (
        <p className="w-full">
          You rejected the share request by {user.name} for{' '}
          <SubscriptionDetail
            className="font-semibold text-expentrac-800 "
            sub={cachedSub ?? sub}
          />{' '}
          by <strong>{user.name}</strong>
        </p>
      )
    default:
      return (
        <p className="w-full">
          <strong>{user.name}</strong> wants to share{' '}
          <SubscriptionDetail
            className="font-semibold text-expentrac-800 hover:text-primary-800"
            sub={sub}
          />{' '}
          with you ({euroFormatter.format(sub.fee.monthly)}/month)
        </p>
      )
  }
}

export const SubShareNotification = ({
  notification
}: {
  notification: NotificationType
}) => {
  const [loading, setLoading] = useState(false)
  const { updateShare } = useShares()
  const { updateNotification } = useNotifications()

  const { id, ack, createdAt } = notification
  const payload = JSON.parse(
    notification.payload as string
  ) as SubShareNotificationPayload

  const handleAccept = async () => {
    setLoading(true)

    const updatedShare = await shareSdk.update(payload.share.id, true)
    const updatedNotification = await notificationSdk.ack(
      id,
      SHARE_STATE.ACCEPTED
    )

    updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)

    const updatedShare = await shareSdk.update(payload.share.id, false)
    const updatedNotification = await notificationSdk.ack(
      id,
      SHARE_STATE.REJECTED
    )

    updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  return (
    <NotificationWrapper
      key={id}
      accept={handleAccept}
      acknowledged={ack}
      date={createdAt}
      loading={loading}
      reject={handleReject}
    >
      <Content payload={payload} />
    </NotificationWrapper>
  )
}
