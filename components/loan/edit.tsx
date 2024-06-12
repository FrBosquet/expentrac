/* eslint-disable prettier/prettier */
'use client'

import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog'
import { type Loan, type LoanFormData } from '@lib/loan'
import { cn } from '@lib/utils'
import { loanSdk } from '@sdk'
import { ButtonVariant } from '@types'
import { Edit, EditIcon } from 'lucide-react'
import { type FormEventHandler, useState } from 'react'

import { useLoans } from './context'
import { LoanForm } from './form'

interface Props {
  loan: Loan
  className?: string
  variant?: ButtonVariant
  triggerDecorator?: React.ReactNode
}

const TRIGGER_DECORATOR = <Edit size={12} />

export const LoanEdit = ({
  loan,
  className,
  variant = 'outline',
  triggerDecorator = TRIGGER_DECORATOR
}: Props) => {
  const { updateLoan } = useLoans()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = Object.fromEntries(
        new FormData(e.currentTarget)
      ) as unknown as LoanFormData

      const updatedLoan = await loanSdk.update(loan.id, formData)

      updateLoan(updatedLoan)
      void loanSdk.revalidate(loan.userId)
      setOpen(false)
    } catch (e) {
      // TODO: toast
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn('p-2 h-auto', className)}
          variant={variant}
          onClick={() => {
            setOpen(true)
          }}
        >
          {triggerDecorator}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EditIcon size={12} />
            <span>Edit loan</span>
          </DialogTitle>
          <DialogDescription>
            Edit <strong className="font-semibold">{loan.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <LoanForm disabled={loading} loan={loan} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
