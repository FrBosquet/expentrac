import { type SHARE_STATE } from '@types'

import { notification } from './decode'
import { arrayOf, envelope, request } from './http'

const get = async (userId?: string, signal?: AbortSignal) =>
  request(
    `notification?${userId ? `userId=${encodeURIComponent(userId)}` : ''}`,
    { signal },
    arrayOf(notification)
  )
const ack = async (id: string, state?: SHARE_STATE) =>
  request(
    `notification/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify({ ack: true, state }) },
    envelope(notification, 'notification')
  )
export const notificationSdk = { get, ack }
