'use client'

import { ProviderDetail } from '@components/ProviderDetail'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Progress } from '@components/ui/progress'
import { Separator } from '@components/ui/separator'
import { euroFormatter } from '@lib/currency'
import { getLoanExtendedInformation } from '@lib/loan'
import { type LoanComplete } from '@types'
import { Edit, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LoanDelete } from './delete'
import { LoanEdit } from './edit'

interface Props {
  loan: LoanComplete
  triggerContent?: React.ReactNode
  children?: React.ReactNode
}

export const LoanDetail = ({ loan, triggerContent = loan.name, children }: Props) => {
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  const { startDate, endDate, fee, name, initial } = loan
  const { paymentsDone, payments, paymentsLeft, paidAmount, totalAmount, owedAmount } = getLoanExtendedInformation(loan)

  useEffect(() => {
    if (!open) {
      setProgress(0)
    } else {
      setTimeout(() => {
        setProgress((paidAmount / totalAmount) * 100)
      }, 175)
    }
  }, [open, payments, paymentsDone])

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
        <section className="grid grid-cols-2 gap-4">
          <article className="grid grid-cols-3 gap-2 col-span-2">
            <ProviderDetail provider={loan.vendor?.provider} label="Vendor" className="col-start-1" />
            <ProviderDetail provider={loan.platform?.provider} label="Platform" className="col-start-2" />
            <ProviderDetail provider={loan.lender?.provider} label="Lender" className="col-start-3" />
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Monthly fee</h4>
            <p className="text-lg text-slate-700">{euroFormatter.format(fee)}</p>
          </article>

          {initial
            ? <article className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold">Initial payment</h4>
              <p className="text-lg text-slate-700">{euroFormatter.format(initial)}</p>
            </article>
            : null}

          <article className="flex flex-col gap-2 col-start-1">
            <h4 className="text-xs font-semibold">Total amount</h4>
            <p className="text-sm text-slate-500">{euroFormatter.format(totalAmount)}</p>
          </article>
          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">Already paid</h4>
            <p className="text-sm text-slate-500">{euroFormatter.format(paidAmount)}</p>
          </article>

          <article className="flex flex-col gap-2 col-span-2">
            <Progress value={progress} />
          </article>

          <Separator className="col-span-2" />

          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">Started</h4>
            <p className="text-sm text-slate-500">{new Date(startDate).toLocaleDateString()}</p>
          </article>
          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">Ends</h4>
            <p className="text-sm text-slate-500">{new Date(endDate).toLocaleDateString()}</p>
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">Payments done</h4>
            <p className="text-sm text-slate-500">{paymentsDone}/{payments}</p>
          </article>
          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">Payments left</h4>
            <p className="text-sm text-slate-500">{paymentsLeft}</p>
          </article>
          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">You still owe</h4>
            <p className="text-sm text-slate-500">{euroFormatter.format(owedAmount)}</p>
          </article>

          <Separator className="col-span-2" />

          <menu className="col-span-2 flex gap-2 justify-end">
            <LoanEdit loan={loan} triggerDecorator={<article className="text-xs flex items-center gap-2"><Edit size={12} /> Edit</article>} />
            <LoanDelete triggerDecorator={<article className="text-xs flex items-center gap-2"><Trash size={12} /> Delete</article>} loan={loan} />
          </menu>
        </section>
      </DialogContent>
    </Dialog>
  )
}
