import { type LoanShareAcceptNotificationPayload } from '@lib/notification/loan-share-accept'
import { type Notification as NotificationType } from '@lib/prisma'
import { useAutoAck } from './hooks'
import { NotificationWrapper } from './wrapper'

export const LoanShareAcceptedNotification = ({ notification }: { notification: NotificationType }) => {
  const { id, ack, createdAt } = notification
  const { shareHolder } = JSON.parse(notification.payload as string) as LoanShareAcceptNotificationPayload

  const { loading } = useAutoAck(notification)

  // TODO: Notification should be created with a contract link, then use the loan detail component to show it here
  return <NotificationWrapper date={createdAt} key={id} loading={loading} acknowledged={ack}>
    <p className='w-full'>{shareHolder.name} accepted to share with you</p>
  </NotificationWrapper>
}
