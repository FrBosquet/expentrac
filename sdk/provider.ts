import { type Brand } from './brands'

import { provider } from './decode'
import { allPages, envelope, request } from './http'

const add = async (body: Brand) =>
  request(
    'provider',
    { method: 'POST', body: JSON.stringify(body) },
    envelope(provider)
  )
const get = (signal?: AbortSignal) => allPages('provider', provider, signal)
export const providerSdk = { add, get }
