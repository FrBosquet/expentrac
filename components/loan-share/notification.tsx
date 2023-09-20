import { LoanDetail } from '@components/loan/detail'
import { Notification } from '@components/notifications/Notification'
import { euroFormatter } from '@lib/currency'
import { updateLoanShare } from '@services/sdk/loanShare'
import { NOTIFICATION_TYPE, type LoanShareComplete, type NotificationBase } from '@types'
import { useState, type ReactNode } from 'react'
import { useLoanShares } from './context'

export type NotificationLoanShare = NotificationBase & {
  type: NOTIFICATION_TYPE.LOAN_SHARES
  meta: LoanShareComplete
}

export const getLoanShareNotification = (loanShare: LoanShareComplete): NotificationLoanShare => ({
  type: NOTIFICATION_TYPE.LOAN_SHARES,
  meta: loanShare,
  ack: loanShare.accepted !== null,
  createdAt: new Date(loanShare.createdAt)
})

const Content = ({ share }: { share: LoanShareComplete }): ReactNode => {
  const { loan, accepted } = share

  const { fee } = loan

  const part = fee / (loan.shares.filter(share => share.accepted === true).length + 1)

  const monthlyFee = `${euroFormatter.format(part)}/mo`

  switch (accepted) {
    case true:
      return <p className='w-full'>You accepted the share request by {loan.user.name} for <LoanDetail loan={loan} className='font-semibold hover:text-primary-800' /> ({monthlyFee})</p>
    case false:
      return <p className='w-full'>You rejected the share request by {loan.user.name} for <LoanDetail loan={loan} className='font-semibold hover:text-primary-800' />({monthlyFee})</p>
    default:
      return <p className='w-full'>{loan.user.name} wants to share <LoanDetail loan={loan} className='font-semibold hover:text-primary-800' />({monthlyFee})</p>
  }
}

export const LoanShareNotification = ({ loanShare }: { loanShare: LoanShareComplete }) => {
  const [loading, setLoading] = useState(false)
  const { updateShare } = useLoanShares()
  const { id } = loanShare

  const handleAccept = async () => {
    setLoading(true)

    const updatedShare = await updateLoanShare(id, true)

    updateShare(updatedShare)

    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)

    const updatedShare = await updateLoanShare(id, false)
    updateShare(updatedShare)

    setLoading(false)
  }

  const acknowledged = loanShare.accepted !== null

  return <Notification date={loanShare.createdAt} key={id} accept={handleAccept} reject={handleReject} loading={loading} acknowledged={acknowledged}>
    <Content share={loanShare} />
  </Notification>
}
