import { Notification } from '@components/notifications/Notification'
import { euroFormatter } from '@lib/currency'

import { SubscriptionDetail } from '@components/subscription/detail'
import { subscriptionShareSdk } from '@services/sdk/subscriptionShare'
import { NOTIFICATION_TYPE, type SubscriptionShareComplete } from '@types'
import { useState, type ReactNode } from 'react'
import { useSubShares } from './context'

export interface NotificationSubShare {
  type: NOTIFICATION_TYPE.SUB_SHARES
  meta: SubscriptionShareComplete
  ack: boolean
}

export const getSubShareNotification = (subShare: SubscriptionShareComplete): NotificationSubShare => ({
  type: NOTIFICATION_TYPE.SUB_SHARES,
  meta: subShare,
  ack: subShare.accepted !== null
})

const Content = ({ share }: { share: SubscriptionShareComplete }): ReactNode => {
  const { subscription, accepted } = share

  const { fee } = subscription

  const part = fee / (subscription.shares.filter(share => share.accepted === true).length + 1)

  const monthlyFee = `${euroFormatter.format(part)}/mo`

  switch (accepted) {
    case true:
      return <p className='w-full whitespace-nowrap overflow-hidden text-ellipsis'>You accepted the share request by {subscription.user.name} for <SubscriptionDetail sub={subscription} className='font-semibold hover:text-primary-800' /> ({monthlyFee})</p>
    case false:
      return <p className='w-full whitespace-nowrap overflow-hidden text-ellipsis'>You rejected the share request by {subscription.user.name} for <SubscriptionDetail sub={subscription} className='font-semibold hover:text-primary-800' />({monthlyFee})</p>
    default:
      return <p className='w-full whitespace-nowrap overflow-hidden text-ellipsis'>{subscription.user.name} wants to share <SubscriptionDetail sub={subscription} className='font-semibold hover:text-primary-800' />({monthlyFee})</p>
  }
}

export const SubscriptionShareNotification = ({ subscriptionShare }: { subscriptionShare: SubscriptionShareComplete }) => {
  const [loading, setLoading] = useState(false)
  const { updateShare } = useSubShares()
  const { id } = subscriptionShare

  const handleAccept = async () => {
    setLoading(true)

    const updatedShare = await subscriptionShareSdk.update(id, true)

    updateShare(updatedShare)

    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)

    const updatedShare = await subscriptionShareSdk.update(id, false)
    updateShare(updatedShare)

    setLoading(false)
  }

  const acknowledged = subscriptionShare.accepted !== null

  return <Notification key={id} accept={handleAccept} reject={handleReject} loading={loading} acknowledged={acknowledged}>
    <Content share={subscriptionShare} />
  </Notification>
}
