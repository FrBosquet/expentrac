import { user } from './decode'
import { envelope, request } from './http'

export const profileSdk = {
  get: (signal?: AbortSignal) => request('profile', { signal }, user),
  update: (body: { name: string; occupation: string }) =>
    request(
      'profile',
      { method: 'PATCH', body: JSON.stringify(body) },
      envelope(user)
    )
}
