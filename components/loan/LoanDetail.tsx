'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { Progress } from "@components/ui/progress"
import { Separator } from "@components/ui/separator"
import { euroFormatter } from "@lib/currency"
import { getLoanExtendedInformation } from "@lib/loan"
import { Loan } from "@prisma/client"
import { Edit, Trash } from "lucide-react"
import { useState } from "react"
import { LoanDelete } from "./LoanDelete"
import { LoanEdit } from "./LoanEdit"

type Props = {
  loan: Loan;
  triggerContent?: React.ReactNode;
};

export const LoanDetail = ({ loan, triggerContent = loan.name }: Props) => {
  const [open, setOpen] = useState(false)

  const { startDate, endDate, fee, name } = loan
  const { paymentsDone, payments, paymentsLeft } = getLoanExtendedInformation(loan)

  const alreadyPaid = paymentsDone * fee
  const total = fee * payments

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
          <article className="flex flex-col gap-2 col-span-2">
            <h4 className="text-sm font-semibold">Monthly fee</h4>
            <p className="text-lg text-slate-700">{euroFormatter.format(fee)}</p>
          </article>

          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">Total amount</h4>
            <p className="text-sm text-slate-500">{euroFormatter.format(total)}</p>
          </article>
          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">Already paid</h4>
            <p className="text-sm text-slate-500">{euroFormatter.format(alreadyPaid)}</p>
          </article>

          <article className="flex flex-col gap-2 col-span-2">
            <Progress value={paymentsDone} max={payments} />
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