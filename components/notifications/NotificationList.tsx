'use client'

import { NOTIFICATION_TYPE } from '@types'
import { twMerge } from 'tailwind-merge'

import { DailyNotification } from './components/daily'
import { LoanShareNotification } from './components/loan-share'
import { LoanShareAcceptedNotification } from './components/loan-share-accepted'
import { LoanShareRejectedNotification } from './components/loan-share-rejected'
import { SubShareNotification } from './components/sub-share'
import { SubShareAcceptedNotification } from './components/sub-share-accepted'
import { SubShareRejectedNotification } from './components/sub-share-rejected'
import { useNotifications } from './context'

interface Props {
  className?: string
}

export const NotificationList = ({ className }: Props) => {
  const { notifications } = useNotifications()

  return (
    <section className={twMerge('flex flex-col gap-2', className)}>
      {notifications.length ? (
        notifications.toReversed().map((notification) => {
          const { id, type } = notification

          switch (type) {
            case NOTIFICATION_TYPE.LOAN_SHARE:
              return (
                <LoanShareNotification key={id} notification={notification} />
              )
            case NOTIFICATION_TYPE.LOAN_SHARE_ACCEPTED:
              return (
                <LoanShareAcceptedNotification
                  key={id}
                  notification={notification}
                />
              )
            case NOTIFICATION_TYPE.LOAN_SHARE_REJECTED:
              return (
                <LoanShareRejectedNotification
                  key={id}
                  notification={notification}
                />
              )
            case NOTIFICATION_TYPE.SUB_SHARE:
              return (
                <SubShareNotification key={id} notification={notification} />
              )
            case NOTIFICATION_TYPE.SUB_SHARE_ACCEPTED:
              return (
                <SubShareAcceptedNotification
                  key={id}
                  notification={notification}
                />
              )
            case NOTIFICATION_TYPE.SUB_SHARE_REJECTED:
              return (
                <SubShareRejectedNotification
                  key={id}
                  notification={notification}
                />
              )
            case NOTIFICATION_TYPE.DAILY:
              return <DailyNotification key={id} notification={notification} />
            default:
              return 'patacas'
          }
        })
      ) : (
        <p className="text-center">Nothing to see here!</p>
      )}
    </section>
  )
}
