import { LoanDetail } from '@components/loan/detail'
import { unwrapLoan } from '@lib/loan'
import { type LoanShareAcceptNotificationPayload } from '@lib/notification/loan-share-accept'
import { type Notification as NotificationType } from '@lib/prisma'
import { useAutoAck } from './hooks'
import { NotificationWrapper } from './wrapper'

export const LoanShareRejectedNotification = ({ notification }: { notification: NotificationType }) => {
  const { id, ack, createdAt } = notification
  const { contract, shareHolder } = JSON.parse(notification.payload as string) as LoanShareAcceptNotificationPayload

  const { loading } = useAutoAck(notification)

  const loan = unwrapLoan(contract)

  return <NotificationWrapper date={createdAt} key={id} loading={loading} acknowledged={ack}>
    <p className='w-full'>{shareHolder.name} refused to share <LoanDetail loan={loan} className='font-semibold hover:text-primary-800' /> with you</p>
  </NotificationWrapper>
}
