'use client'

import { NOTIFICATION_TYPE } from '@types'
import { DailyNotification } from './components/daily'
import { LoanShareNotification } from './components/loan-share'
import { LoanShareAcceptedNotification } from './components/loan-share-accepted'
import { LoanShareRejectedNotification } from './components/loan-share-rejected'
import { SubscriptionShareNotification } from './components/sub-share'
import { SubShareAcceptedNotification } from './components/sub-share-accepted'
import { SubShareRejectedNotification } from './components/sub-share-rejected'
import { useNotifications } from './context'

export const NotificationList = () => {
  const { notifications } = useNotifications()

  return <section className="flex flex-col gap-2 py-6">
    {
      notifications.length
        ? notifications.map((notification) => {
          const { id, type } = notification

          switch (type) {
            case NOTIFICATION_TYPE.LOAN_SHARE:
              return <LoanShareNotification key={id} notification={notification} />
            case NOTIFICATION_TYPE.LOAN_SHARE_ACCEPTED:
              return <LoanShareAcceptedNotification key={id} notification={notification} />
            case NOTIFICATION_TYPE.LOAN_SHARE_REJECTED:
              return <LoanShareRejectedNotification key={id} notification={notification} />
            case NOTIFICATION_TYPE.SUB_SHARE:
              return <SubscriptionShareNotification key={id} notification={notification} />
            case NOTIFICATION_TYPE.SUB_SHARE_ACCEPTED:
              return <SubShareAcceptedNotification key={id} notification={notification} />
            case NOTIFICATION_TYPE.SUB_SHARE_REJECTED:
              return <SubShareRejectedNotification key={id} notification={notification} />
            case NOTIFICATION_TYPE.DAILY:
              return <DailyNotification key={id} notification={notification} />
            default:
              return 'patacas'
          }
        })
        : <p className="text-center">Nothing to see here!</p>
    }
  </section>
}
