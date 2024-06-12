import { LoanDetail } from '@components/loan/detail'
import { SubscriptionDetail } from '@components/subscription/detail'
import { unwrapLoan } from '@lib/loan'
import { type DailyNotificationPayload } from '@lib/notification/daily'
import { type Notification as NotificationType } from '@lib/prisma'
import { unwrapSub } from '@lib/sub'

import { useAutoAck } from './hooks'
import { NotificationWrapper } from './wrapper'

export const DailyNotification = ({
  notification
}: {
  notification: NotificationType
}) => {
  const { id, ack, createdAt } = notification
  const { subs, loans } = JSON.parse(
    notification.payload as string
  ) as DailyNotificationPayload

  const { loading } = useAutoAck(notification)

  return (
    <NotificationWrapper
      key={id}
      acknowledged={ack}
      date={createdAt}
      loading={loading}
    >
      <p className="w-full">Today, you are paying for:</p>
      <ul className="flex w-full flex-col gap-2 p-1">
        {loans?.map((contract, index) => {
          if (!contract.type) return null // TODO: Remove, this is legacy notification model

          const loan = unwrapLoan(contract)

          return (
            <li key={index} className="text-xs">
              <LoanDetail loan={loan} /> - {loan.fee.holder}€
            </li>
          )
        })}
        {subs?.map((contract, index) => {
          if (!contract.type) return null // TODO: Remove, this is legacy notification model

          const sub = unwrapSub(contract)

          return (
            <li key={index} className="text-xs">
              <SubscriptionDetail sub={sub} /> - {sub.fee.holder}€
            </li>
          )
        })}
      </ul>
    </NotificationWrapper>
  )
}
