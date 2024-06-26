'use client'

import { LoanDetail } from '@components/loan/detail'
import { SubscriptionDetail } from '@components/subscription/detail'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog'
import { Separator } from '@components/ui/separator'
import { euroFormatter } from '@lib/currency'
import { type Provider } from '@lib/prisma'
import { cn } from '@lib/utils'
import { useState } from 'react'

import { useProviderExtendedInfo } from './hooks'

interface Props {
  provider: Provider
  children: React.ReactNode
}

const Item = ({ children }: { children: React.ReactNode }) => (
  <span className="block w-full truncate text-left text-xs font-light">
    {children}
  </span>
)

export const ProviderDetail = ({ provider, children }: Props) => {
  const [open, setOpen] = useState(false)

  const { url, fromLoans, fromSubs, lengths, totals } =
    useProviderExtendedInfo(provider)

  if (!provider.isFetched) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="transition-all hover:scale-110 hover:text-primary hover:shadow-2xl">
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{provider.name}</DialogTitle>
          <DialogDescription>Provider detail</DialogDescription>
        </DialogHeader>
        <section className="grid grid-cols-3 gap-4">
          <article className="col-span-3 flex flex-col gap-2">
            <a
              className="text-primary visited:text-yellow-600"
              href={url}
              rel="noreferrer"
              target="_blank"
            >
              {url}
            </a>
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">
              As vendor ({lengths.asVendor})
            </h4>
            <p
              className={cn(
                'text-xs font-semibold',
                totals.asVendor === 0 && 'text-slate-400 font-thin'
              )}
            >
              {euroFormatter.format(totals.asVendor)}/mo
            </p>
            {fromLoans.asVendor.map((item) => {
              return (
                <LoanDetail key={item.id} loan={item}>
                  <Item>{item.name}</Item>
                </LoanDetail>
              )
            })}
            {fromLoans.asVendor.length > 0 && fromSubs.asVendor.length > 0 && (
              <Separator />
            )}
            {fromSubs.asVendor.map((item) => {
              return (
                <SubscriptionDetail key={item.id} sub={item}>
                  <Item>{item.name}</Item>
                </SubscriptionDetail>
              )
            })}
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">
              As platform ({lengths.asPlatform})
            </h4>
            <p
              className={cn(
                'text-xs font-semibold',
                totals.asPlatform === 0 && 'text-slate-400 font-thin'
              )}
            >
              {euroFormatter.format(totals.asPlatform)}/mo
            </p>
            {fromLoans.asPlatform.map((item) => {
              return (
                <LoanDetail key={item.id} loan={item}>
                  <Item>{item.name}</Item>
                </LoanDetail>
              )
            })}
            {fromLoans.asPlatform.length > 0 &&
              fromSubs.asPlatform.length > 0 && <Separator />}
            {fromSubs.asPlatform.map((item) => {
              return (
                <SubscriptionDetail key={item.id} sub={item}>
                  <Item>{item.name}</Item>
                </SubscriptionDetail>
              )
            })}
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">
              As lender ({lengths.asLender})
            </h4>
            <p
              className={cn(
                'text-xs font-semibold',
                totals.asLender === 0 && 'text-slate-400 font-thin'
              )}
            >
              {euroFormatter.format(totals.asLender)}/mo
            </p>
            {fromLoans.asLender.map((item) => {
              return (
                <LoanDetail key={item.id} loan={item}>
                  <Item>{item.name}</Item>
                </LoanDetail>
              )
            })}
          </article>
        </section>
      </DialogContent>
    </Dialog>
  )
}
