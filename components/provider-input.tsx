import { prisma } from '@lib/prisma'

import { ProviderSelect } from './ProviderSelect'

type Props = Omit<React.ComponentProps<typeof ProviderSelect>, 'items'>

export const ProviderInput = async (props: Props) => {
  const providers = await prisma.provider.findMany({
    orderBy: {
      name: 'asc'
    }
  })
  const brandOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.name
  }))

  return <ProviderSelect items={brandOptions} {...props} />
}
