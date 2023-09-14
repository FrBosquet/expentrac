import { getUrl } from '@lib/api'

export const deleteLoanShare = async (id: string) => {
  const url = getUrl(`loan-share?id=${id}`)

  await fetch(url, { method: 'DELETE' })
}
