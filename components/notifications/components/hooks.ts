import { useAckWrite } from '@hooks/resources'
import { type Notification as NotificationType } from '@lib/models'
import { useLayoutEffect, useState } from 'react'

export const useAutoAck = (notification: NotificationType) => {
  const [loading, setLoading] = useState(false)
  const acknowledge = useAckWrite()

  const { id, ack } = notification

  useLayoutEffect(() => {
    if (ack) return

    const ackNotificationAsync = async () => {
      setLoading(true)
      try {
        await acknowledge(id)
      } finally {
        setLoading(false)
      }
    }

    void ackNotificationAsync().catch(() => {})
  }, [ack, id, acknowledge])

  return { loading }
}
