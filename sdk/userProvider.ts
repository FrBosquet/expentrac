import { type Brand } from '@components/BrandAutocomplete'
import { getTag, getUrl } from '@lib/api'
import { type UserProviderComplete } from '@types'

export const getUserProviders = async (userId: string) => {
  const url = getUrl(`user-provider?userId=${userId}`)

  const response = await fetch(url, { next: { tags: [getTag('user-provider', userId)] } })
  const subscriptions: UserProviderComplete[] = await response.json()

  return subscriptions
}

export const revalidateUserProviders = async (userId: string) => {
  const url = getUrl(`revalidate?tag=${getTag('user-provider', userId)}&secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}`)

  const response = await fetch(url, { method: 'POST' })

  return response
}

export const addUserProvider = async (brand: Brand) => {
  const result = await fetch(getUrl('/user-provider'), {
    method: 'POST',
    body: JSON.stringify(brand)
  })

  const { data } = await result.json() as { data: UserProviderComplete }

  return data
}

export const userProviderSdk = {
  get: getUserProviders,
  revalidate: revalidateUserProviders,
  add: addUserProvider
}
