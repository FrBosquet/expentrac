'use client'

import { useUser } from '@components/Provider'
import { ProviderDetail } from '@components/ProviderDetail'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Progress } from '@components/ui/progress'
import { Separator } from '@components/ui/separator'
import { euroFormatter } from '@lib/currency'
import { getLoanExtendedInformation } from '@lib/loan'
import { type LoanComplete } from '@types'
import { Edit, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { LoanDelete } from './delete'
import { LoanEdit } from './edit'

interface Props {
  loan: LoanComplete
  triggerContent?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

const SharesDetail = ({ loan: { shares, fee, user: loanUser } }: { loan: LoanComplete }) => {
  const { user: currentUser } = useUser()

  const parts = shares.filter(share => share.accepted === true).length + 1
  const chargeByPart = fee / parts
  const inEuros = `${euroFormatter.format(chargeByPart)}/m`

  const userOwnThis = currentUser.id === loanUser.id

  return <>
    <Separator className="col-span-2" />
    <section className='col-span-2 flex flex-col gap-2'>

      <p className="text-sm">This loan fee is shared by:</p>
      <article className="flex items-center gap-2">
        <p className={twMerge('text-sm font-semibold', userOwnThis && 'flex-1')}>{userOwnThis ? 'You' : `${loanUser.name} (owner)`}</p>
        {
          userOwnThis
            ? null
            : <p className="text-sm text-slate-500 flex-1">{loanUser.email}</p>
        }
        <p className="text-xs">{inEuros}</p>
      </article>
      {
        shares.map((share) => {
          const { user } = share
          const { accepted } = share

          const isCurrentUser = currentUser.id === user.id

          return <article key={share.id} className="flex items-center gap-2">
            <p className={twMerge('text-sm font-semibold', isCurrentUser && 'flex-1')}>{isCurrentUser ? 'You' : user.name}</p>
            {!isCurrentUser ? <p className="text-sm text-slate-500 flex-1">{user.email}{ }</p> : null}
            {
              accepted === true
                ? <p className='text-xs'>{inEuros}</p>
                : null
            }
            {
              accepted === false
                ? <p className='text-xs'>Rejected</p>
                : null
            }
            {
              accepted === null
                ? <p className='text-xs'>Pending</p>
                : null
            }
          </article>
        })
      }
    </section>
  </>
}

export const LoanDetail = ({ loan, triggerContent = loan.name, children, className }: Props) => {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  const { startDate, endDate, fee, name, initial } = loan
  const { paymentsDone, payments, paymentsLeft, paidAmount, totalAmount, owedAmount, hasShares } = getLoanExtendedInformation(loan)

  const userOwnThis = user.id === loan.userId

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
        <button className={twMerge('hover:text-primary', className)}>{children ?? triggerContent}</button>
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

          {
            hasShares && <SharesDetail loan={loan} />
          }

          {
            userOwnThis
              ? <>
                <Separator className="col-span-2" />
                <menu className="col-span-2 flex gap-2 justify-end" >
                  <LoanEdit loan={loan} triggerDecorator={<article className="text-xs flex items-center gap-2"><Edit size={12} /> Edit</article>} />
                  <LoanDelete triggerDecorator={<article className="text-xs flex items-center gap-2"><Trash size={12} /> Delete</article>} loan={loan} />
                </menu>
              </>
              : null
          }
        </section>
      </DialogContent>
    </Dialog >
  )
}
