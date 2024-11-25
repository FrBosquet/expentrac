'use server'

import { getUserData } from '@app/dashboard/profile/getUser'
import { CONTRACT_TYPE } from '@lib/contract'
import { prisma } from '@lib/prisma'

export const fetchWorkContracts = async () => {
  const user = await getUserData()

  if (!user) {
    return []
  }

  const contracts = await prisma.contract.findMany({
    where: {
      userId: user.id,
      type: CONTRACT_TYPE.WORK
    },
    include: {
      providers: {
        include: {
          provider: true
        }
      },
      periods: true
    }
  })

  return contracts
}
