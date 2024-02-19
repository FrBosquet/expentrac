'use client'

import { ProviderDetail } from '@components/ProviderDetail'
import { SharesDetail } from '@components/common/shares-detail'
import { useDate } from '@components/date/context'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Separator } from '@components/ui/separator'
import { useUser } from '@components/user/hooks'
import { euroFormatter } from '@lib/currency'
import { monthBeetween } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { Edit, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
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

export const SubscriptionDetail = ({ sub, triggerContent = sub?.name, children, className }: Props) => {
  const [open, setOpen] = useState(false)
  const { ownsResource } = useUser()
  const { push } = useRouter()
  const userOwnThis = ownsResource(sub)

  if (!sub) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={twMerge('hover:text-primary', className)}>{children ?? triggerContent}</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => {
        e.preventDefault()
      }}>
        <DialogHeader>
          <DialogTitle>{sub.name}</DialogTitle>
          <DialogDescription>
            Subscription details
          </DialogDescription>
        </DialogHeader>
        <SubDetailContent sub={sub} />
        {
          userOwnThis && (
            <>
              <Separator className="col-span-2" />
              <menu className="col-span-2 flex gap-2 justify-end">
                <SubscriptionEdit sub={sub} triggerDecorator={<article className="text-xs flex items-center gap-2"><Edit size={12} /> Edit</article>} />
                <SubDelete sideEffect={() => {
                  push('/dashboard/subscriptions')
                }} triggerDecorator={<article className="text-xs flex items-center gap-2"><Trash size={12} /> Delete</article>} sub={sub} />
              </menu>
            </>
          )
        }
      </DialogContent>
    </Dialog>
  )
}

export const SubDetailContent = ({ sub, className }: { sub: Subscription, className?: string }) => {
  const { date } = useDate()
  const { fee: { monthly, yearly }, providers: { vendor, platform }, time: { payday, paymonth }, resources: { link }, shares: { total }, time: { isYearly }, periods: { active } } = sub

  const isActive = active && new Date(active.from) < date

  const ndate = new Date()
  if (paymonth) ndate.setMonth(paymonth)
  if (payday) ndate.setDate(payday)

  return <section className={twMerge('grid grid-cols-2 gap-6', className)}>
    <article className="grid grid-cols-2 gap-2 col-span-2">
      <ProviderDetail provider={vendor} label="Vendor" className="col-start-1" />
      <ProviderDetail provider={platform} label="Platform" className="col-start-2" />
    </article>

    {
      isYearly && (
        <article className="flex flex-col gap-2">
          <h4 className="dashboard-label">Yearly fee</h4>
          <p className="dashboard-value">{euroFormatter.format(yearly)}</p>
        </article>
      )
    }

    <article className="flex flex-col gap-2">
      <h4 className="dashboard-label">Monthly fee</h4>
      <p className="dashboard-value">{euroFormatter.format(monthly)}</p>
    </article>
    {
      payday
        ? <article className="flex flex-col gap-2">
          <h4 className="dashboard-label">Payment day</h4>
          <p className="dashboard-value">{

            isYearly ? ndate.toLocaleDateString('default', { month: 'short', day: 'numeric' }) : payday}</p>
        </article>
        : null
    }

    {
      link
        ? <article className="flex flex-col gap-2 col-span-2">
          <a target='_blank' href={link} className="text-xs font-semibold hover:text-primary-800 transition" rel="noreferrer">Subscription link</a>
        </article>
        : null
    }

    {
      isActive
        ? <>
          <article className="flex flex-col gap-2">
            <h4 className="dashboard-label">Started</h4>
            <p className="dashboard-value">{new Date(active.from).toLocaleDateString('default', {
              year: '2-digit',
              month: 'short'
            })}</p>
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="dashboard-label">Months active</h4>
            <p className="dashboard-value">{monthBeetween(new Date(active.from), date)}</p>
          </article>
        </>
        : null
    }

    {
      total > 0 && (
        <>
          <SharesDetail contract={sub} />
        </>
      )
    }
  </section>
}
