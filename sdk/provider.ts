import { type Brand } from '@components/BrandAutocomplete'

import { provider } from './decode'
import { envelope, request } from './http'

const add = async (body: Brand) =>
  request(
    'provider',
    { method: 'POST', body: JSON.stringify(body) },
    envelope(provider)
  )
export const providerSdk = { add }
