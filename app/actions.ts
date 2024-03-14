'use server'

import { prisma } from '@lib/prisma'
import { redirect } from 'next/navigation'

export const pauseSubscription = async (formData: FormData): Promise<void> => {
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

  redirect('/dashboard/subscriptions')
}
