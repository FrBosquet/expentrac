'use client'

import { LoanShareNotification } from '@components/loan-share/notification'
import { NOTIFICATION_TYPE, useNotifications } from './hooks'

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
