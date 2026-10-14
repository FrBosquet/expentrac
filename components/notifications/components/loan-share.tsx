import { useLoan } from '@components/loan/context'
import { LoanDetail } from '@components/loan/detail'
import { useAckWrite, useShareWrite } from '@hooks/resources'
import { euroFormatter } from '@lib/currency'
import { unwrapLoan } from '@lib/loan'
import { type Notification as NotificationType, type Share } from '@lib/models'
import { type LoanShareNotificationPayload } from '@lib/notification/loan-share'
import { NOTIFICATION_TYPE, type NotificationBase, SHARE_STATE } from '@types'
import { type ReactNode, useState } from 'react'

import { NotificationWrapper } from './wrapper'

export type NotificationLoanShare = NotificationBase & {
  type: NOTIFICATION_TYPE.LOAN_SHARE
  meta: Share
}

export const getLoanShareNotification = (
  share: Share
): NotificationLoanShare => ({
  type: NOTIFICATION_TYPE.LOAN_SHARE,
  meta: share,
  ack: share.accepted !== null,
  createdAt: new Date(share.createdAt)
})

const Content = ({
  payload
}: {
  payload: LoanShareNotificationPayload
}): ReactNode => {
  const { state, contract } = payload
  const loan = unwrapLoan(contract)

  const { loan: cachedLoan } = useLoan(loan.id)

  const { user } = loan
  switch (true) {
    case state === SHARE_STATE.ACCEPTED:
      return (
        <p className="w-full">
          You accepted the share request for{' '}
          <LoanDetail
            className="font-semibold text-expentrac-800"
            loan={cachedLoan ?? loan}
          />{' '}
          by <strong>{user.name}</strong>
        </p>
      )
    case state === SHARE_STATE.REJECTED:
      return (
        <p className="w-full">
          You rejected the share request for{' '}
          <LoanDetail
            className="font-semibold text-expentrac-800"
            loan={cachedLoan ?? loan}
          />{' '}
          by <strong>{user.name}</strong>
        </p>
      )
    default:
      return (
        <p className="w-full">
          <strong>{user.name}</strong> wants to share{' '}
          <LoanDetail
            className="font-semibold text-expentrac-800"
            loan={loan}
          />{' '}
          with you ({euroFormatter.format(loan.fee.monthly)}/month)
        </p>
      )
  }
}

export const LoanShareNotification = ({
  notification
}: {
  notification: NotificationType
}) => {
  const [loading, setLoading] = useState(false)
  const respond = useShareWrite()
  const acknowledge = useAckWrite()
  const { id, ack, createdAt } = notification
  const payload = JSON.parse(
    notification.payload as string
  ) as LoanShareNotificationPayload

  const handleAccept = async () => {
    setLoading(true)
    try {
      await respond(payload.share.id, true)
      await acknowledge(id, SHARE_STATE.ACCEPTED)
    } catch {
      /* Mutation hook displays the error. */
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await respond(payload.share.id, false)
      await acknowledge(id, SHARE_STATE.REJECTED)
    } catch {
      /* Mutation hook displays the error. */
    } finally {
      setLoading(false)
    }
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
