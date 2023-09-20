import { useLoanShares } from '@components/loan-share/context'
import { getLoanShareNotification } from '@components/loan-share/notification'
import { useSubShares } from '@components/subscription-share/context'
import { getSubShareNotification } from '@components/subscription-share/notification'

export const useNotifications = () => {
  const { loanShares } = useLoanShares()
  const { subShares } = useSubShares()

  const notifications = [
    ...loanShares.map(getLoanShareNotification),
    ...subShares.map(getSubShareNotification)
  ]

  const hasPending = notifications.some((notification) => !notification.ack)

  return {
    notifications,
    hasPending
  }
}
