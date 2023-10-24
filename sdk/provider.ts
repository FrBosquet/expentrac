import { type Brand } from '@components/BrandAutocomplete'
import { getUrl } from '@lib/api'
import { type Provider } from '@lib/prisma'

const add = async (body: Brand) => {
  const result = await fetch(getUrl('/provider'), {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const { data } = await result.json() as { data: Provider }
  return data
}

export const providerSdk = {
  add
}
