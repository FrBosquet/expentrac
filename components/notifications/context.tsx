'use client'
import { useNotificationQuery } from '@hooks/resources'
export const useNotifications = () => {
  const query = useNotificationQuery()
  const pending = query.notifications.filter((n) => !n.ack).length
  return { ...query, hasPending: pending > 0, pending }
}
