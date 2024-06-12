'use client'

import { ProviderDetail } from '@components/ProviderDetail'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog'
import { Progress } from '@components/ui/progress'
import { Separator } from '@components/ui/separator'
import { useUser } from '@components/user/hooks'
import { euroFormatter } from '@lib/currency'
import { type Loan } from '@lib/loan'
import { Edit, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { SharesDetail } from '../common/shares-detail'
import { LoanDelete } from './delete'
import { LoanEdit } from './edit'

interface Props {
  loan: Loan
  triggerContent?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export const LoanDetail = ({
  loan,
  triggerContent = loan.name,
  children,
  className
}: Props) => {
  const { push } = useRouter()
  const { ownsResource } = useUser()
  const [open, setOpen] = useState(false)
  const { name } = loan
  const userOwnThis = ownsResource(loan)

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
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Loan details</DialogDescription>
        </DialogHeader>
        <LoanDetailContent loan={loan} />
        {userOwnThis ? (
          <>
            <Separator />
            <menu className="flex justify-end gap-2">
              <LoanEdit
                loan={loan}
                triggerDecorator={
                  <article className="flex items-center gap-2 text-xs">
                    <Edit size={12} /> Edit
                  </article>
                }
              />
              <LoanDelete
                loan={loan}
                sideEffect={async () => {
                  push('/dashboard/loans')
                }}
                triggerDecorator={
                  <article className="flex items-center gap-2 text-xs">
                    <Trash size={12} /> Delete
                  </article>
                }
              />
            </menu>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export const LoanDetailContent = ({
  loan,
  className
}: {
  loan: Loan
  className?: string
}) => {
  const [progress, setProgress] = useState(0)

  const {
    startDate,
    endDate,
    fee: { initial, monthly },
    payments: { done: paymentsDone, total: payments, left: paymentsLeft },
    amount: { paid: paidAmount, total: totalAmount, owed: owedAmount },
    shares: { hasAny: hasShares },
    time: { hasEnded: isOver },
    providers: { lender, platform, vendor }
  } = loan

  useEffect(() => {
    if (!open) {
      setProgress(0)
    } else {
      setTimeout(() => {
        setProgress((paidAmount / totalAmount) * 100)
      }, 175)
    }
  }, [paidAmount, payments, paymentsDone, totalAmount])

  return (
    <section className={twMerge('grid grid-cols-2 gap-4', className)}>
      <article className="col-span-2 grid grid-cols-3 gap-2">
        <ProviderDetail
          className="col-start-1"
          label="Vendor"
          provider={vendor}
        />
        <ProviderDetail
          className="col-start-2"
          label="Platform"
          provider={platform}
        />
        <ProviderDetail
          className="col-start-3"
          label="Lender"
          provider={lender}
        />
      </article>

      <article className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold">Monthly fee</h4>
        <p className="text-lg text-foreground">
          {euroFormatter.format(monthly)}
        </p>
      </article>

      {initial ? (
        <article className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold">Initial payment</h4>
          <p className="text-lg text-foreground">
            {euroFormatter.format(initial)}
          </p>
        </article>
      ) : null}

      <article className="col-start-1 flex flex-col gap-2">
        <h4 className="text-xs font-semibold">Total amount</h4>
        <p className="text-sm text-theme-light">
          {euroFormatter.format(totalAmount)}
        </p>
      </article>
      {!isOver ? (
        <article className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold">Already paid</h4>
          <p className="text-sm text-theme-light">
            {euroFormatter.format(paidAmount)}
          </p>
        </article>
      ) : null}

      <article className="col-span-2 flex flex-col gap-2">
        <Progress value={progress} />
      </article>

      <Separator className="col-span-2" />

      <article className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold">Started</h4>
        <p className="text-sm text-theme-light">
          {new Date(startDate).toLocaleDateString()}
        </p>
      </article>
      <article className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold">
          {isOver ? 'Finished' : 'Ends'}
        </h4>
        <p className="text-sm text-theme-light">
          {new Date(endDate).toLocaleDateString()}
        </p>
      </article>

      {!isOver ? (
        <>
          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">Payments done</h4>
            <p className="text-sm text-theme-light">
              {paymentsDone}/{payments}
            </p>
          </article>
          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">Payments left</h4>
            <p className="text-sm text-theme-light">{paymentsLeft}</p>
          </article>
          <article className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold">You still owe</h4>
            <p className="text-sm text-theme-light">
              {euroFormatter.format(owedAmount)}
            </p>
          </article>
        </>
      ) : null}

      {hasShares && <SharesDetail contract={loan} />}
    </section>
  )
}
