import { type DailyNotificationPayload } from '@lib/notification/daily'
import { type Notification as NotificationType } from '@lib/prisma'
import { useAutoAck } from './hooks'
import { NotificationWrapper } from './wrapper'

export const DailyNotification = ({ notification }: { notification: NotificationType }) => {
  const { id, ack, createdAt } = notification
  const { subs, loans } = JSON.parse(notification.payload as string) as DailyNotificationPayload

  const { loading } = useAutoAck(notification)

  return <NotificationWrapper date={createdAt} key={id} loading={loading} acknowledged={ack}>
    <p className='w-full'>Today, you are paying for:</p>
    <ul className='w-full flex gap-2 p-1'>
      {loans.map((loan, index) => <li className='text-xs' key={index}><strong>{loan.name}</strong> (loan) - {loan.fee}€</li>)}
      {subs.map((sub, index) => <li className='text-xs' key={index}><strong>{sub.name}</strong> (subscription) - {sub.fee}€</li>)}
    </ul>
  </NotificationWrapper>
}
