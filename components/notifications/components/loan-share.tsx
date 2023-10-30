import { useLoan } from '@components/loan/context'
import { LoanDetail } from '@components/loan/detail'
import { useNotifications } from '@components/notifications/context'
import { useShares } from '@components/share/hooks'
import { euroFormatter } from '@lib/currency'
import { unwrapLoan } from '@lib/loan'
import { type LoanShareNotificationPayload } from '@lib/notification/loan-share'
import { type Notification as NotificationType, type Share } from '@lib/prisma'
import { notificationSdk } from '@sdk/notifications'
import { shareSdk } from '@sdk/share'
import { NOTIFICATION_TYPE, SHARE_STATE, type NotificationBase } from '@types'
import { useState, type ReactNode } from 'react'
import { NotificationWrapper } from './wrapper'

export type NotificationLoanShare = NotificationBase & {
  type: NOTIFICATION_TYPE.LOAN_SHARE
  meta: Share
}

export const getLoanShareNotification = (share: Share): NotificationLoanShare => ({
  type: NOTIFICATION_TYPE.LOAN_SHARE,
  meta: share,
  ack: share.accepted !== null,
  createdAt: new Date(share.createdAt)
})

const Content = ({ payload }: { payload: LoanShareNotificationPayload }): ReactNode => {
  const { state, contract } = payload
  const loan = unwrapLoan(contract)

  const { loan: cachedLoan } = useLoan(loan.id)

  const { user } = loan
  switch (true) {
    case state === SHARE_STATE.ACCEPTED:
      return <p className='w-full'>You accepted the share request for <LoanDetail loan={cachedLoan ?? loan} className='font-semibold text-expentrac-800' /> by <strong>{user.name}</strong></p>
    case state === SHARE_STATE.REJECTED:
      return <p className='w-full'>You rejected the share request for <LoanDetail loan={cachedLoan ?? loan} className='font-semibold text-expentrac-800' /> by <strong>{user.name}</strong></p>
    default:
      return <p className='w-full'><strong>{user.name}</strong> wants to share <LoanDetail loan={loan} className='font-semibold text-expentrac-800' /> with you ({euroFormatter.format(loan.fee.monthly)}/month)</p>
  }
}

export const LoanShareNotification = ({ notification }: { notification: NotificationType }) => {
  const [loading, setLoading] = useState(false)
  const { updateShare } = useShares()
  const { updateNotification } = useNotifications()
  const { id, ack, createdAt } = notification
  const payload = JSON.parse(notification.payload as string) as LoanShareNotificationPayload

  const handleAccept = async () => {
    setLoading(true)

    // const updatedShare = await updateLoanShare(payload.loanShare.id, true)
    const updatedShare = await shareSdk.update(payload.share.id, true)
    const updatedNotification = await notificationSdk.ack(id, SHARE_STATE.ACCEPTED)

    updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)

    const updatedShare = await shareSdk.update(payload.share.id, false)
    const updatedNotification = await notificationSdk.ack(id, SHARE_STATE.REJECTED)

    updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  return <NotificationWrapper date={createdAt} key={id} accept={handleAccept} reject={handleReject} loading={loading} acknowledged={ack}>
    <Content payload={payload} />
  </NotificationWrapper>
}
