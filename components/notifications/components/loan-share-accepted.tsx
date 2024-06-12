import { LoanDetail } from '@components/loan/detail'
import { unwrapLoan } from '@lib/loan'
import { type LoanShareAcceptNotificationPayload } from '@lib/notification/loan-share-accept'
import { type Notification as NotificationType } from '@lib/prisma'

import { useAutoAck } from './hooks'
import { NotificationWrapper } from './wrapper'

export const LoanShareAcceptedNotification = ({
  notification
}: {
  notification: NotificationType
}) => {
  const { id, ack, createdAt } = notification
  const { shareHolder, contract } = JSON.parse(
    notification.payload as string
  ) as LoanShareAcceptNotificationPayload

  const { loading } = useAutoAck(notification)

  // TODO: Notification should be created with a contract link, then use the loan detail component to show it here
  return (
    <NotificationWrapper
      key={id}
      acknowledged={ack}
      date={createdAt}
      loading={loading}
    >
      <p className="w-full">
        {shareHolder.name} accepted to share{' '}
        <LoanDetail
          className="font-semibold text-expentrac-800"
          loan={unwrapLoan(contract)}
        />{' '}
        with you
      </p>
    </NotificationWrapper>
  )
}
