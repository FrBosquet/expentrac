import { SubscriptionDetail } from '@components/subscription/detail'
import { type SubShareAcceptNotificationPayload } from '@lib/notification/sub-share-accept'
import { type Notification as NotificationType } from '@lib/prisma'
import { unwrapSub } from '@lib/sub'
import { useAutoAck } from './hooks'
import { NotificationWrapper } from './wrapper'

export const SubShareAcceptedNotification = ({ notification }: { notification: NotificationType }) => {
  const { id, ack, createdAt } = notification
  const { contract, user } = JSON.parse(notification.payload as string) as SubShareAcceptNotificationPayload

  const { loading } = useAutoAck(notification)

  return <NotificationWrapper date={createdAt} key={id} loading={loading} acknowledged={ack}>
    <p className='w-full'>{user.name} accepted to share <SubscriptionDetail sub={unwrapSub(contract)} className='text-expentrac-800' /> with you</p>
  </NotificationWrapper>
}
