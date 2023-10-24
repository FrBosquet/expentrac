import { useNotifications } from '@components/notifications/context'
import { useShares } from '@components/share/hooks'
import { SubscriptionDetail } from '@components/subscription/detail'
import { euroFormatter } from '@lib/currency'
import { type SubShareNotificationPayload } from '@lib/notification/sub-share'
import { type Share, type Notification as NotificationType } from '@lib/prisma'
import { unwrapSub } from '@lib/sub'
import { ackNotification } from '@sdk/notifications'
import { shareSdk } from '@sdk/share'
import { NOTIFICATION_TYPE, SHARE_STATE, type NotificationBase } from '@types'
import { useState, type ReactNode } from 'react'
import { NotificationWrapper } from './wrapper'

export type NotificationSubShare = NotificationBase & {
  type: NOTIFICATION_TYPE.SUB_SHARE
  meta: Share
}

export const getSubShareNotification = (share: Share): NotificationSubShare => ({
  type: NOTIFICATION_TYPE.SUB_SHARE,
  meta: share,
  ack: share.accepted !== null,
  createdAt: new Date(share.createdAt)
})

const Content = ({ payload }: { payload: SubShareNotificationPayload }): ReactNode => {
  const { contract, state } = payload

  const sub = unwrapSub(contract)
  const monthlyFee = `${euroFormatter.format(sub.fee.holder)}/mo`

  switch (state) {
    case SHARE_STATE.ACCEPTED:
      return <p className='w-full'>You accepted the share request by {contract.user.name} for <SubscriptionDetail contract={contract} className='font-semibold hover:text-primary-800' /> ({monthlyFee})</p>
    case SHARE_STATE.REJECTED:
      return <p className='w-full'>You rejected the share request by {contract.user.name} for <SubscriptionDetail contract={contract} className='font-semibold hover:text-primary-800' />({monthlyFee})</p>
    default:
      return <p className='w-full'>{contract.user.name} wants to share <SubscriptionDetail contract={contract} className='font-semibold hover:text-primary-800' />({monthlyFee})</p>
  }
}

export const SubscriptionShareNotification = ({ notification }: { notification: NotificationType }) => {
  const [loading, setLoading] = useState(false)
  const { updateShare } = useShares()
  const { updateNotification } = useNotifications()

  const { id, ack, createdAt } = notification
  const payload = JSON.parse(notification.payload as string) as SubShareNotificationPayload

  const handleAccept = async () => {
    setLoading(true)

    const updatedShare = await shareSdk.update(payload.share.id, true) // TODO: Use share SDK
    const updatedNotification = await ackNotification(id, SHARE_STATE.ACCEPTED)

    updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)

    const updatedShare = await shareSdk.update(payload.share.id, false) // TODO: Use share SDK
    const updatedNotification = await ackNotification(id, SHARE_STATE.REJECTED)

    updateShare(updatedShare)
    updateNotification(updatedNotification)

    setLoading(false)
  }

  return <NotificationWrapper date={createdAt} key={id} accept={handleAccept} reject={handleReject} loading={loading} acknowledged={ack}>
    <Content payload={payload} />
  </NotificationWrapper>
}
