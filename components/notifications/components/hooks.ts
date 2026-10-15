import { useAckWrite } from '@hooks/resources'
import { type Notification as NotificationType } from '@lib/models'
import { useEffect } from 'react'

export const useAutoAck = (notification: NotificationType) => {
  const { mutate, isPending, error } = useAckWrite()
  const { id, ack } = notification
  useEffect(() => {
    if (!ack) mutate({ id })
  }, [ack, id, mutate])
  return { loading: isPending, error, retry: () => mutate({ id }) }
}
