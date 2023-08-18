'use client'

import { ProviderDetail } from "@components/ProviderDetail"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { Separator } from "@components/ui/separator"
import { euroFormatter } from "@lib/currency"
import { SubscriptionComplete } from "@types"
import { Edit, Trash } from "lucide-react"
import { useState } from "react"
import { SubscriptionDelete } from "./delete"
import { SubscriptionEdit } from "./edit"

type Props = {
  sub: SubscriptionComplete;
  triggerContent?: React.ReactNode;
};

export const SubscriptionDetail = ({ sub, triggerContent = sub.name }: Props) => {
  const [open, setOpen] = useState(false)

  const { fee, name } = sub

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="hover:text-primary">{triggerContent}</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>
            Loan details
          </DialogDescription>
        </DialogHeader>
        <section className="grid grid-cols-2 gap-4">
          <article className="grid grid-cols-2 gap-2 col-span-2">
            <ProviderDetail provider={sub.vendor?.provider} label="Vendor" className="col-start-1" />
            <ProviderDetail provider={sub.platform?.provider} label="Platform" className="col-start-2" />
          </article>
          <article className="flex flex-col gap-2 col-span-2">
            <h4 className="text-sm font-semibold">Monthly fee</h4>
            <p className="text-lg text-slate-700">{euroFormatter.format(fee)}</p>
          </article>

          <Separator className="col-span-2" />

          <menu className="col-span-2 flex gap-2 justify-end">
            <SubscriptionEdit sub={sub} triggerDecorator={<article className="text-xs flex items-center gap-2"><Edit size={12} /> Edit</article>} />
            <SubscriptionDelete triggerDecorator={<article className="text-xs flex items-center gap-2"><Trash size={12} /> Delete</article>} sub={sub} />
          </menu>
        </section>
      </DialogContent>
    </Dialog>
  )
}