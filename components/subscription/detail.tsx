'use client'

import { ProviderDetail } from '@components/ProviderDetail'
import { SharesDetail } from '@components/common/shares-detail'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Separator } from '@components/ui/separator'
import { useUser } from '@components/user/hooks'
import { euroFormatter } from '@lib/currency'
import { type Subscription } from '@lib/sub'
import { Edit, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { SubscriptionDelete } from './delete'
import { SubscriptionEdit } from './edit'

interface Props {
  sub: Subscription
  triggerContent?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export const SubscriptionDetail = ({ sub, triggerContent = sub?.name, children, className }: Props) => {
  const [open, setOpen] = useState(false)

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
      </DialogContent>
    </Dialog>
  )
}

export const SubDetailContent = ({ sub, className }: { sub: Subscription, className?: string }) => {
  const { push } = useRouter()
  const { ownsResource } = useUser()

  const { fee: { monthly, yearly }, providers: { vendor, platform }, time: { payday }, resources: { link }, shares: { total }, time: { isYearly } } = sub

  const userOwnThis = ownsResource(sub)

  return <section className={twMerge('grid grid-cols-2 gap-6', className)}>
    <article className="grid grid-cols-2 gap-2 col-span-2">
      <ProviderDetail provider={vendor} label="Vendor" className="col-start-1" />
      <ProviderDetail provider={platform} label="Platform" className="col-start-2" />
    </article>

    {
      isYearly && (
        <article className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold">Yearly fee</h4>
          <p className="text-lg text-foreground">{euroFormatter.format(yearly)}</p>
        </article>
      )
    }

    <article className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold">Monthly fee</h4>
      <p className="text-lg text-foreground">{euroFormatter.format(monthly)}</p>
    </article>
    {
      payday
        ? <article className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold">Payment day</h4>
          <p className="text-lg text-foreground">{payday}</p>
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
      total > 0 && (
        <>
          <SharesDetail contract={sub} />
        </>
      )
    }
    {
      userOwnThis && (
        <>
          <Separator className="col-span-2" />
          <menu className="col-span-2 flex gap-2 justify-end">
            <SubscriptionEdit sub={sub} triggerDecorator={<article className="text-xs flex items-center gap-2"><Edit size={12} /> Edit</article>} />
            <SubscriptionDelete sideEffect={() => {
              push('/dashboard/subscriptions')
            }} triggerDecorator={<article className="text-xs flex items-center gap-2"><Trash size={12} /> Delete</article>} sub={sub} />
          </menu>
        </>
      )
    }
  </section>
}
