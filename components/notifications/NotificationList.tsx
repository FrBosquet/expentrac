'use client'

import { useLoanShares } from '@components/loan-share/Context'
import { LoanDetail } from '@components/loan/detail'
import { Button } from '@components/ui/button'
import { euroFormatter } from '@lib/currency'
import { updateLoanShare } from '@services/sdk/loanShare'
import { type LoanShareComplete } from '@types'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { NOTIFICATION_TYPE, useNotifications } from './hook'

const Notification = ({ children, accept, reject, loading }: { children: React.ReactNode, accept: () => void, reject: () => void, loading: boolean }) => {
  return <div className='p-2 flex shadow-md gap-2'>
    <section className={twMerge('flex-1', loading && 'opacity-40')}>
      {children}
    </section>
    <Button disabled={loading} variant='default' className={'p-2 h-auto'} onClick={accept}><Check size={14} /></Button>
    <Button disabled={loading} variant='destructive' className={'p-2 h-auto'} onClick={reject}><X size={14} /></Button>
  </div>
}

const LoanShareNotification = ({ loanShare }: { loanShare: LoanShareComplete }) => {
  const [loading, setLoading] = useState(false)
  const { updateShare } = useLoanShares()
  const { loan, id } = loanShare
  const { user, fee } = loan

  const part = fee / 2

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

  return <Notification key={id} accept={handleAccept} reject={handleReject} loading={loading}>
    <p>{user.name} wants to share <LoanDetail loan={loan} /> ({euroFormatter.format(part)}/m)</p>
  </Notification>
}

export const NotificationList = () => {
  const { notifications } = useNotifications()

  return <section className="flex flex-col gap-2 py-6">
    {
      notifications.length
        ? notifications.map((notification) => {
          const { meta, type } = notification

          switch (type) {
            case NOTIFICATION_TYPE.LOAN_SHARES:
              return <LoanShareNotification key={meta.id} loanShare={meta} />
            default:
              return null
          }
        })
        : <p className="text-center">Nothing to see here!</p>
    }
  </section>
}
