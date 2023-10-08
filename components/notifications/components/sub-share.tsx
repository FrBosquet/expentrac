import { useNotifications } from '@components/notifications/context'
import { SubscriptionDetail } from '@components/subscription/detail'
import { euroFormatter } from '@lib/currency'
import { type SubShareNotificationPayload } from '@lib/notification/sub-share'
import { type Notification as NotificationType } from '@lib/prisma'
import { ackNotification } from '@sdk/notifications'
import { subscriptionShareSdk } from '@sdk/subscriptionShare'
import { NOTIFICATION_TYPE, SHARE_STATE, type NotificationBase, type SubscriptionShareComplete } from '@types'
import { useState, type ReactNode } from 'react'
import { useSubShares } from '../../subscription-share/context'
import { NotificationWrapper } from './wrapper'

export type NotificationSubShare = NotificationBase & {
  type: NOTIFICATION_TYPE.SUB_SHARE
  meta: SubscriptionShareComplete
}

export const getSubShareNotification = (subShare: SubscriptionShareComplete): NotificationSubShare => ({
  type: NOTIFICATION_TYPE.SUB_SHARE,
  meta: subShare,
  ack: subShare.accepted !== null,
  createdAt: new Date(subShare.createdAt)
})

const Content = ({ payload }: { payload: SubShareNotificationPayload }): ReactNode => {
  const { sub, state } = payload

  const { fee } = sub

  const part = fee / (sub.shares.filter(share => share.accepted === true).length + 1)

  const monthlyFee = `${euroFormatter.format(part)}/mo`

  switch (state) {
    case SHARE_STATE.ACCEPTED:
      return <p className='w-full'>You accepted the share request by {sub.user.name} for <SubscriptionDetail sub={sub} className='font-semibold hover:text-primary-800' /> ({monthlyFee})</p>
    case SHARE_STATE.REJECTED:
      return <p className='w-full'>You rejected the share request by {sub.user.name} for <SubscriptionDetail sub={sub} className='font-semibold hover:text-primary-800' />({monthlyFee})</p>
    default:
      return <p className='w-full'>{sub.user.name} wants to share <SubscriptionDetail sub={sub} className='font-semibold hover:text-primary-800' />({monthlyFee})</p>
  }
}

export const SubscriptionShareNotification = ({ notification }: { notification: NotificationType }) => {
  const [loading, setLoading] = useState(false)
  const { updateShare } = useSubShares()
  const { updateNotification } = useNotifications()

  const { id, ack, createdAt } = notification
  const payload = JSON.parse(notification.payload as string) as SubShareNotificationPayload

  const handleAccept = async () => {
    setLoading(true)

    const updatedShare = await subscriptionShareSdk.update(payload.subShare.id, true)
    const updatedNotification = await ackNotification(id, SHARE_STATE.ACCEPTED)

    updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)

    const updatedShare = await subscriptionShareSdk.update(payload.subShare.id, false)
    const updatedNotification = await ackNotification(id, SHARE_STATE.REJECTED)

    updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  return <NotificationWrapper date={createdAt} key={id} accept={handleAccept} reject={handleReject} loading={loading} acknowledged={ack}>
    <Content payload={payload} />
  </NotificationWrapper>
}
