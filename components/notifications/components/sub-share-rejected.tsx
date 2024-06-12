import { SubscriptionDetail } from '@components/subscription/detail'
import { type SubShareAcceptNotificationPayload } from '@lib/notification/sub-share-accept'
import { type Notification as NotificationType } from '@lib/prisma'
import { unwrapSub } from '@lib/sub'

import { useAutoAck } from './hooks'
import { NotificationWrapper } from './wrapper'

export const SubShareRejectedNotification = ({
  notification
}: {
  notification: NotificationType
}) => {
  const { id, ack, createdAt } = notification
  const { contract, user } = JSON.parse(
    notification.payload as string
  ) as SubShareAcceptNotificationPayload

  const { loading } = useAutoAck(notification)

  return (
    <NotificationWrapper
      key={id}
      acknowledged={ack}
      date={createdAt}
      loading={loading}
    >
      <p className="w-full">
        {user.name} refused to share{' '}
        <SubscriptionDetail
          className="text-expentrac-800"
          sub={unwrapSub(contract)}
        />{' '}
        with you
      </p>
    </NotificationWrapper>
  )
}
