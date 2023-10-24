import { useNotifications } from '@components/notifications/context'
import { type LoanShareNotificationPayload } from '@lib/notification/loan-share'
import { type Share, type Notification as NotificationType } from '@lib/prisma'
import { ackNotification } from '@sdk/notifications'
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
  const { state } = payload

  // const { fee } = loan

  // const part = fee / (loan.shares.filter(share => share.accepted === true).length + 1)

  // const monthlyFee = `${euroFormatter.format(part)}/mo`

  // TODO: Notification should be created with a contract link, then use the loan detail component to show it here
  switch (true) {
    case state === SHARE_STATE.ACCEPTED:
      return <p className='w-full'>You accepted the share request by WE NEED THE NOTIFICATION TO HAVE THE LOAN CONTENT</p>
    case state === SHARE_STATE.REJECTED:
      return <p className='w-full'>You rejected the share request by WE NEED THE NOTIFICATION TO HAVE THE LOAN CONTENT</p>
    default:
      return <p className='w-full'>LOAN.USER.NAME wants to share WE NEED THE NOTIFICATION TO HAVE THE LOAN CONTENT</p>
  }
}

export const LoanShareNotification = ({ notification }: { notification: NotificationType }) => {
  const [loading, setLoading] = useState(false)
  // const { updateShare } = useLoanShares()
  const { updateNotification } = useNotifications()
  const { id, ack, createdAt } = notification
  const payload = JSON.parse(notification.payload as string) as LoanShareNotificationPayload

  const handleAccept = async () => {
    setLoading(true)

    // const updatedShare = await updateLoanShare(payload.loanShare.id, true)
    const updatedNotification = await ackNotification(id, SHARE_STATE.ACCEPTED)

    // updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)

    // const updatedShare = await updateLoanShare(payload.loanShare.id, false)
    const updatedNotification = await ackNotification(id, SHARE_STATE.REJECTED)

    // updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  return <NotificationWrapper date={createdAt} key={id} accept={handleAccept} reject={handleReject} loading={loading} acknowledged={ack}>
    <Content payload={payload} />
  </NotificationWrapper>
}
