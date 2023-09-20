'use client'

import { useUser } from '@components/Provider'
import { ProviderDetail } from '@components/ProviderDetail'
import { SharesDetail } from '@components/common/shares-detail'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Separator } from '@components/ui/separator'
import { euroFormatter } from '@lib/currency'
import { type SubscriptionComplete } from '@types'
import { Edit, Trash } from 'lucide-react'
import { useState } from 'react'
import { SubscriptionDelete } from './delete'
import { SubscriptionEdit } from './edit'

interface Props {
  sub: SubscriptionComplete
  triggerContent?: React.ReactNode
  children?: React.ReactNode
}

export const SubscriptionDetail = ({ sub, triggerContent = sub.name, children }: Props) => {
  const { ownsAsset } = useUser()

  const [open, setOpen] = useState(false)

  const { fee, name } = sub

  const userOwnThis = ownsAsset(sub)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="hover:text-primary">{children ?? triggerContent}</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => {
        e.preventDefault()
      }}>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>
            Loan details
          </DialogDescription>
        </DialogHeader>
        <section className="grid grid-cols-2 gap-6">
          <article className="grid grid-cols-2 gap-2 col-span-2">
            <ProviderDetail provider={sub.vendor?.provider} label="Vendor" className="col-start-1" />
            <ProviderDetail provider={sub.platform?.provider} label="Platform" className="col-start-2" />
          </article>

          {
            sub.yearly && (
              <article className="flex flex-col gap-2">
                <h4 className="text-sm font-semibold">Yearly fee</h4>
                <p className="text-lg text-slate-700">{euroFormatter.format(fee)}</p>
              </article>
            )
          }

          <article className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Monthly fee</h4>
            <p className="text-lg text-slate-700">{euroFormatter.format(sub.yearly ? fee / 12 : fee)}</p>
          </article>

          {
            sub.shares.length > 0 && (
              <>
                <SharesDetail assetType='subscription' asset={sub} />
              </>
            )
          }
          {
            userOwnThis && (
              <>
                <Separator className="col-span-2" />
                <menu className="col-span-2 flex gap-2 justify-end">
                  <SubscriptionEdit sub={sub} triggerDecorator={<article className="text-xs flex items-center gap-2"><Edit size={12} /> Edit</article>} />
                  <SubscriptionDelete triggerDecorator={<article className="text-xs flex items-center gap-2"><Trash size={12} /> Delete</article>} sub={sub} />
                </menu>
              </>
            )
          }
        </section>
      </DialogContent>
    </Dialog>
  )
}
