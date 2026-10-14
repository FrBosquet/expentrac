'use client'
import { useProviderCatalog } from '@hooks/resources'

import { ProviderSelect } from './ProviderSelect'
type Props = Omit<React.ComponentProps<typeof ProviderSelect>, 'items'>
export const ProviderInput = (props: Props) => {
  const query = useProviderCatalog()
  if (query.isPending) return <p role="status">Loading providers…</p>
  if (query.isError) return <p role="alert">{query.error?.message}</p>
  return (
    <ProviderSelect
      items={query.providers.map((provider) => ({
        value: provider.id,
        label: provider.name
      }))}
      {...props}
    />
  )
}
