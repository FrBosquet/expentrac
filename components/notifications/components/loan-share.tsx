import { LoanDetail } from '@components/loan/detail'
import { useNotifications } from '@components/notifications/context'
import { euroFormatter } from '@lib/currency'
import { type LoanShareNotificationPayload } from '@lib/notification/loan-share'
import { type Notification as NotificationType } from '@lib/prisma'
import { updateLoanShare } from '@sdk/loanShare'
import { ackNotification } from '@sdk/notifications'
import { NOTIFICATION_TYPE, SHARE_STATE, type LoanShareComplete, type NotificationBase } from '@types'
import { useState, type ReactNode } from 'react'
import { useLoanShares } from '../../loan-share/context'
import { NotificationWrapper } from './wrapper'

export type NotificationLoanShare = NotificationBase & {
  type: NOTIFICATION_TYPE.LOAN_SHARE
  meta: LoanShareComplete
}

export const getLoanShareNotification = (loanShare: LoanShareComplete): NotificationLoanShare => ({
  type: NOTIFICATION_TYPE.LOAN_SHARE,
  meta: loanShare,
  ack: loanShare.accepted !== null,
  createdAt: new Date(loanShare.createdAt)
})

const Content = ({ payload }: { payload: LoanShareNotificationPayload }): ReactNode => {
  const { loan, state } = payload

  const { fee } = loan

  const part = fee / (loan.shares.filter(share => share.accepted === true).length + 1)

  const monthlyFee = `${euroFormatter.format(part)}/mo`

  switch (true) {
    case state === SHARE_STATE.ACCEPTED:
      return <p className='w-full'>You accepted the share request by {loan.user.name} for <LoanDetail loan={loan} className='font-semibold hover:text-primary-800' /> ({monthlyFee})</p>
    case state === SHARE_STATE.REJECTED:
      return <p className='w-full'>You rejected the share request by {loan.user.name} for <LoanDetail loan={loan} className='font-semibold hover:text-primary-800' />({monthlyFee})</p>
    default:
      return <p className='w-full'>{loan.user.name} wants to share <LoanDetail loan={loan} className='font-semibold hover:text-primary-800' />({monthlyFee})</p>
  }
}

export const LoanShareNotification = ({ notification }: { notification: NotificationType }) => {
  const [loading, setLoading] = useState(false)
  const { updateShare } = useLoanShares()
  const { updateNotification } = useNotifications()
  const { id, ack, createdAt } = notification
  const payload = JSON.parse(notification.payload as string) as LoanShareNotificationPayload

  const handleAccept = async () => {
    setLoading(true)

    const updatedShare = await updateLoanShare(payload.loanShare.id, true)
    const updatedNotification = await ackNotification(id, SHARE_STATE.ACCEPTED)

    updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)

    const updatedShare = await updateLoanShare(payload.loanShare.id, false)
    const updatedNotification = await ackNotification(id, SHARE_STATE.REJECTED)

    updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  return <NotificationWrapper date={createdAt} key={id} accept={handleAccept} reject={handleReject} loading={loading} acknowledged={ack}>
    <Content payload={payload} />
  </NotificationWrapper>
}
