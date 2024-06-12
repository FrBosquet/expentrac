import { LoanDetail } from '@components/loan/detail'
import { unwrapLoan } from '@lib/loan'
import { type LoanShareAcceptNotificationPayload } from '@lib/notification/loan-share-accept'
import { type Notification as NotificationType } from '@lib/prisma'

import { useAutoAck } from './hooks'
import { NotificationWrapper } from './wrapper'

export const LoanShareRejectedNotification = ({
  notification
}: {
  notification: NotificationType
}) => {
  const { id, ack, createdAt } = notification
  const { contract, shareHolder } = JSON.parse(
    notification.payload as string
  ) as LoanShareAcceptNotificationPayload

  const { loading } = useAutoAck(notification)

  const loan = unwrapLoan(contract)

  return (
    <NotificationWrapper
      key={id}
      acknowledged={ack}
      date={createdAt}
      loading={loading}
    >
      <p className="w-full">
        {shareHolder.name} refused to share{' '}
        <LoanDetail
          className="font-semibold hover:text-primary-800"
          loan={loan}
        />{' '}
        with you
      </p>
    </NotificationWrapper>
  )
}
