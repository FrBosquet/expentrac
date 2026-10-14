import { eurosToCents } from '@lib/money'
import { CONTRACT_TYPE, subscriptionInclude } from '@lib/contract'
import { PERIODICITY } from '@lib/dates'
import { safeDto } from '@lib/dto'
import { type Contract } from '@lib/models'
import { prisma } from '@lib/prisma'

import { ApiError, requireUser } from './api'
import { amount, dateInput, identifier, integer } from './validation'

export async function changeSubscriptionPeriod(
  form: FormData,
  action: 'pause' | 'price' | 'resume'
): Promise<Contract> {
  const userId = await requireUser()
  const id = identifier(form.get('id'))
  const date = dateInput(form.get('date'))
  return prisma.$transaction(
    async (db) => {
      const sub = await db.contract.findUnique({
        where: { id },
        include: { periods: { orderBy: { from: 'desc' } } }
      })
      if (!sub) throw new ApiError(404, 'Subscription not found')
      if (sub.userId !== userId) throw new ApiError(403, 'Forbidden')
      if (sub.type !== CONTRACT_TYPE.SUBSCRIPTION)
        throw new ApiError(400, 'Invalid contract type')
      const active = sub.periods.find((period) => period.to === null)
      if (action === 'resume') {
        if (active) throw new ApiError(409, 'Subscription is already active')
        if (sub.periods.some((p) => !p.to || new Date(p.to) >= date))
          throw new ApiError(400, 'Resume date overlaps an existing period')
        const yearly = form.get('yearly') === 'on'
        await db.period.create({
          data: {
            contractId: id,
            from: date,
            feeCents: eurosToCents(amount(form.get('fee'))),
            payday: integer(form.get('payday'), 'payday', 1, 31),
            paymonth: yearly
              ? integer(form.get('paymonth'), 'paymonth', 0, 11)
              : null,
            periodicity: yearly ? PERIODICITY.YEARLY : PERIODICITY.MONTHLY
          }
        })
      } else {
        if (!active) throw new ApiError(409, 'Subscription is not active')
        if (date < new Date(active.from))
          throw new ApiError(400, 'Date precedes current period')
        if (action === 'pause') {
          await db.period.update({
            where: { id: active.id },
            data: { to: date }
          })
        } else {
          const feeCents = eurosToCents(amount(form.get('fee')))
          if (date.getTime() === new Date(active.from).getTime()) {
            await db.period.update({
              where: { id: active.id },
              data: { feeCents }
            })
          } else {
            await db.period.update({
              where: { id: active.id },
              data: { to: new Date(date.getTime() - 86_400_000) }
            })
            await db.period.create({
              data: {
                contractId: id,
                from: date,
                feeCents,
                payday: active.payday,
                paymonth: active.paymonth,
                periodicity: active.periodicity
              }
            })
          }
        }
      }
      const updated = await db.contract.findUnique({
        where: { id },
        include: subscriptionInclude
      })
      return safeDto(updated) as Contract
    },
    { isolationLevel: 'Serializable' }
  )
}
