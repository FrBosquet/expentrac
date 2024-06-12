'use client'

import { useStore } from '@store'
import { getPendingNotifications } from '@store/notification'

export const useNotifications = () => {
  const notifications = useStore((state) => state.notifications)
  const updateNotification = useStore((state) => state.updateNotification)

  const pendingNotifications = useStore(getPendingNotifications)

  return {
    notifications,
    updateNotification,
    hasPending: pendingNotifications.length > 0,
    pending: pendingNotifications.length
  }
}
