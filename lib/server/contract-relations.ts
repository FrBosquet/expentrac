import { type Prisma } from '@lib/prisma'

export function updateContractLink(
  resources: Array<{ id: string; type: string }>,
  url: string
): Prisma.ResourceUpdateManyWithoutContractNestedInput {
  const existing = resources.find((resource) => resource.type === 'LINK')
  return existing
    ? { update: { where: { id: existing.id }, data: { url } } }
    : { create: { name: 'link', type: 'LINK', url } }
}
