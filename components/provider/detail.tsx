'use client'

import { LoanDetail } from '@components/loan/detail'
import { SubscriptionDetail } from '@components/subscription/detail'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Separator } from '@components/ui/separator'
import { euroFormatter } from '@lib/currency'
import { cn } from '@lib/utils'
import { type UserProviderComplete } from '@types'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import { ProviderDelete } from './delete'
import { useProviderExtendedInfo } from './hooks'

interface Props {
  userProvider: UserProviderComplete
  children: React.ReactNode
}

const Item = ({ children }: { children: React.ReactNode }) => <span className="block w-full text-xs font-light whitespace-nowrap overflow-hidden overflow-ellipsis text-left">{children}</span>

export const ProviderDetail = ({ userProvider, children }: Props) => {
  const [open, setOpen] = useState(false)

  const {
    provider,
    url,
    fromLoans,
    fromSubs,
    lengths,
    totals,
    hasAnyItem
  } = useProviderExtendedInfo(userProvider)

  if (!provider.isFetched) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="hover:text-primary hover:shadow-2xl hover:scale-110 transition-all">{children}</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{provider.name}</DialogTitle>
          <DialogDescription>
            Provider detail
          </DialogDescription>
        </DialogHeader>
        <section className="grid grid-cols-3 gap-4">
          <article className="flex flex-col gap-2 col-span-3">
            <a target="_blank" className="text-primary visited:text-yellow-600" href={url} rel="noreferrer">{url}</a>
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">As vendor ({lengths.asVendor})</h4>
            <p className={cn('text-xs font-semibold', totals.asVendor === 0 && 'text-slate-400 font-thin')}>{euroFormatter.format(totals.asVendor)}/mo</p>
            {
              fromLoans.asVendor.map((item) => {
                return <LoanDetail loan={item} key={item.id}>
                  <Item>{item.name}</Item>
                </LoanDetail>
              })
            }
            {
              fromLoans.asVendor.length > 0 && fromSubs.asVendor.length > 0 && <Separator />
            }
            {
              fromSubs.asVendor.map((item) => {
                return <SubscriptionDetail sub={item} key={item.id}>
                  <Item>{item.name}</Item>
                </SubscriptionDetail>
              })
            }
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">As platform ({lengths.asPlatform})</h4>
            <p className={cn('text-xs font-semibold', totals.asPlatform === 0 && 'text-slate-400 font-thin')}>{euroFormatter.format(totals.asPlatform)}/mo</p>
            {
              fromLoans.asPlatform.map((item) => {
                return <LoanDetail loan={item} key={item.id}>
                  <Item>{item.name}</Item>
                </LoanDetail>
              })
            }
            {fromLoans.asPlatform.length > 0 && fromSubs.asPlatform.length > 0 && <Separator />}
            {
              fromSubs.asPlatform.map((item) => {
                return <SubscriptionDetail sub={item} key={item.id}>
                  <Item>{item.name}</Item>
                </SubscriptionDetail>
              })
            }
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">As lender ({lengths.asLender})</h4>
            <p className={cn('text-xs font-semibold', totals.asLender === 0 && 'text-slate-400 font-thin')}>{euroFormatter.format(totals.asLender)}/mo</p>
            {
              fromLoans.asLender.map((item) => {
                return <LoanDetail loan={item} key={item.id}>
                  <Item>{item.name}</Item>
                </LoanDetail>
              })
            }
          </article>

          <Separator className="col-span-3" />

          <menu className="col-span-3 flex gap-2 justify-end">
            <ProviderDelete disabled={hasAnyItem} userProvider={userProvider} triggerDecorator={<span className="text-xs flex items-center gap-2"><Trash size={12} /> Delete</span>} />
          </menu>
        </section>
      </DialogContent>
    </Dialog>
  )
}
