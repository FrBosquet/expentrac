import { type Notification as NotificationType } from '@lib/prisma'
import { notificationSdk } from '@sdk'
import { useLayoutEffect, useState } from 'react'

import { useNotifications } from '../context'

export const useAutoAck = (notification: NotificationType) => {
  const [loading, setLoading] = useState(false)
  const { updateNotification } = useNotifications()

  const { id, ack } = notification

  useLayoutEffect(() => {
    if (ack) return

    const ackNotificationAsync = async () => {
      setLoading(true)
      const updatedNotification = await notificationSdk.ack(id)
      setLoading(false)
      updateNotification(updatedNotification)
    }

    void ackNotificationAsync()
  }, [ack, id, updateNotification])

  return { loading }
}
