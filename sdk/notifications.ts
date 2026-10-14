import { type SHARE_STATE } from '@types'

import { notification } from './decode'
import { allPages, envelope, request } from './http'

const get = async (userId?: string, signal?: AbortSignal) =>
  allPages(
    `notification?${userId ? `userId=${encodeURIComponent(userId)}` : ''}`,
    notification,
    signal
  )
const ack = async (id: string, state?: SHARE_STATE) =>
  request(
    `notification/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify({ ack: true, state }) },
    envelope(notification, 'notification')
  )
export const notificationSdk = { get, ack }
