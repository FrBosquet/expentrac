'use server'

import { subscriptionInclude } from '@lib/contract'
import { PERIODICITY } from '@lib/dates'
import { type Contract, prisma } from '@lib/prisma'

export const pauseSubscription = async (
  formData: FormData
): Promise<Contract> => {
  const id = formData.get('id') as string

  const sub = await prisma.contract.findUnique({
    where: {
      id
    },
    include: {
      periods: {
        where: {
          to: null
        }
      }
    }
  })

  if (!sub) throw new Error('Subscription not found')
  if (sub.periods.length === 0) throw new Error('Subscription is not active')

  const [period] = sub.periods

  const date = new Date(formData.get('date') as string)

  await prisma.period.update({
    where: {
      id: period.id
    },
    data: {
      to: date
    }
  })

  // get the updated contract
  const contract = await prisma.contract.findUnique({
    where: {
      id
    },
    include: subscriptionInclude
  })

  return contract as Contract
}

export const updateSubscriptionPrice = async (
  formData: FormData
): Promise<Contract> => {
  const id = formData.get('id') as string

  const sub = await prisma.contract.findUnique({
    where: {
      id
    },
    include: {
      periods: {
        where: {
          to: null
        }
      }
    }
  })

  if (!sub) throw new Error('Subscription not found')
  if (sub.periods.length === 0) throw new Error('Subscription is not active')

  const [period] = sub.periods

  const date = new Date(formData.get('date') as string)
  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() - 1)

  await prisma.period.update({
    where: {
      id: period.id
    },
    data: {
      to: endDate
    }
  })

  await prisma.period.create({
    data: {
      from: date,
      contract: {
        connect: {
          id
        }
      },
      fee: Number(formData.get('fee')),
      periodicity: period.periodicity,
      payday: period.payday,
      paymonth: period.paymonth
    }
  })

  // get the updated contract
  const contract = await prisma.contract.findUnique({
    where: {
      id
    },
    include: subscriptionInclude
  })

  return contract as Contract
}

export const resumeSubscription = async (
  formData: FormData
): Promise<Contract> => {
  const id = formData.get('id') as string

  const sub = await prisma.contract.findUnique({
    where: {
      id
    },
    include: {
      periods: {
        where: {
          to: null
        }
      }
    }
  })

  if (!sub) throw new Error('Subscription not found')
  if (sub.periods.length > 0) throw new Error('Subscription is active')

  const date = new Date(formData.get('date') as string)
  const fee = Number(formData.get('fee'))
  const yearly = formData.get('yearly') === 'on'
  const payday = Number(formData.get('payday'))
  const paymonth = formData.get('paymonth')

  await prisma.period.create({
    data: {
      from: date,
      contract: {
        connect: {
          id
        }
      },
      fee,
      payday,
      paymonth: paymonth ? Number(paymonth) : undefined,
      periodicity: yearly ? PERIODICITY.YEARLY : PERIODICITY.MONTHLY
    }
  })

  // get the updated contract
  const contract = await prisma.contract.findUnique({
    where: {
      id
    },
    include: subscriptionInclude
  })

  return contract as Contract
}
