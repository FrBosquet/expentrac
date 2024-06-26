'use client'

import { SharesDetail } from '@components/common/shares-detail'
import { useDate } from '@components/date/context'
import { ProviderDetail } from '@components/ProviderDetail'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog'
import { Separator } from '@components/ui/separator'
import { useUser } from '@components/user/hooks'
import { euroFormatter } from '@lib/currency'
import { isInSameMont, monthBeetween } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { Period } from '@prisma/client'
import { Edit, Trash } from 'lucide-react'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { SubDelete } from './delete'
import { SubscriptionEdit } from './edit'

interface Props {
  sub: Subscription
  triggerContent?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export const SubscriptionDetail = ({
  sub,
  triggerContent = sub?.name,
  children,
  className
}: Props) => {
  const [open, setOpen] = useState(false)
  const { ownsResource } = useUser()
  const userOwnThis = ownsResource(sub)

  if (!sub) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={twMerge('hover:text-primary', className)}>
          {children ?? triggerContent}
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{sub.name}</DialogTitle>
          <DialogDescription>Subscription details</DialogDescription>
        </DialogHeader>
        <SubDetailContent sub={sub} />
        {userOwnThis && (
          <>
            <Separator className="col-span-2" />
            <menu className="col-span-2 flex justify-end gap-2">
              <SubscriptionEdit
                sub={sub}
                triggerDecorator={
                  <article className="flex items-center gap-2 text-xs">
                    <Edit size={12} /> Edit
                  </article>
                }
              />
              <SubDelete afterDeleteUrl="/dashboard/subscriptions" sub={sub}>
                <article className="flex items-center gap-2 text-xs">
                  <Trash size={12} /> Delete
                </article>
              </SubDelete>
            </menu>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

const isActiveInThisMonth = (refDate: Date, active?: Period | undefined) => {
  if (!active) return false

  const fromDate = new Date(active.from)

  if (fromDate < refDate) return true

  const sameMonth = isInSameMont(fromDate, refDate)

  if (
    sameMonth &&
    fromDate.getDate() <= (active?.payday ?? Number.MAX_SAFE_INTEGER)
  )
    return true

  if (active.to) {
    const toDate = new Date(active.to)

    if (
      isInSameMont(toDate, refDate) &&
      toDate.getDate() >= (active?.payday ?? 0)
    )
      return true

    if (toDate > refDate) return true
  }

  return false
}

export const SubDetailContent = ({
  sub,
  className
}: {
  sub: Subscription
  className?: string
}) => {
  const { date } = useDate()
  const {
    fee: { monthly, yearly },
    providers: { vendor, platform },
    time: { payday, paymonth },
    shares: { total },
    time: { isYearly },
    periods: { active }
  } = sub

  const isActive = isActiveInThisMonth(date, active)
  const ndate = new Date()
  if (paymonth) ndate.setMonth(paymonth)
  if (payday) ndate.setDate(payday)

  return (
    <section className={twMerge('grid grid-cols-2 gap-6', className)}>
      {isYearly && (
        <article className="flex flex-col gap-2">
          <h4 className="dashboard-label">Yearly fee</h4>
          <p className="dashboard-value">{euroFormatter.format(yearly)}</p>
        </article>
      )}

      <article className="flex flex-col gap-2">
        <h4 className="dashboard-label">Monthly fee</h4>
        <p className="dashboard-value">{euroFormatter.format(monthly)}</p>
      </article>
      {payday ? (
        <article className="flex flex-col gap-2">
          <h4 className="dashboard-label">Payment day</h4>
          <p className="dashboard-value">
            {isYearly
              ? ndate.toLocaleDateString('default', {
                month: 'short', // eslint-disable-line
                day: 'numeric' //eslint-disable-line
              }) // eslint-disable-line
              : payday}
          </p>
        </article>
      ) : null}

      {isActive ? (
        <>
          <article className="flex flex-col gap-2">
            <h4 className="dashboard-label">Started</h4>
            <p className="dashboard-value">
              {new Date(active.from).toLocaleDateString('default', {
                year: '2-digit',
                month: 'short'
              })}
            </p>
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="dashboard-label">Months active</h4>
            <p className="dashboard-value">
              {monthBeetween(new Date(active.from), date) || 'First month'}
            </p>
          </article>
        </>
      ) : null}

      {total > 0 && (
        <>
          <SharesDetail contract={sub} />
        </>
      )}
      <article className="col-span-2 grid grid-cols-2 gap-2 ">
        <ProviderDetail
          withName
          className="col-start-1 items-start"
          label="Vendor"
          provider={vendor}
        />
        <ProviderDetail
          withName
          className="col-start-2 w-auto items-start"
          label="Platform"
          provider={platform}
        />
      </article>
    </section>
  )
}
