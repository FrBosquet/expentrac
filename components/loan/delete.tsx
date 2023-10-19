'use client'

import { SubmitButton } from '@components/Form'
import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { type Loan } from '@lib/loan'
import { cn } from '@lib/utils'
import { loanSdk } from '@sdk'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import { useLoans } from './context'

interface Props {
  loan: Loan
  className?: string
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
  triggerDecorator?: React.ReactNode
  sideEffect?: () => Promise<void>
}

const TRIGGER_DECORATOR = <Trash size={12} />

export const LoanDelete = ({ loan, className, variant = 'destructive', triggerDecorator = TRIGGER_DECORATOR, sideEffect }: Props) => {
  const { id, name } = loan
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { removeLoan } = useLoans()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const loan = await loanSdk.delete(id)

      removeLoan(loan)
      void loanSdk.revalidate(loan.userId)
      setOpen(false)
      void sideEffect?.()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn('p-2 h-auto', className)} onClick={() => { setOpen(true) }}>{triggerDecorator}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete loan</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <SubmitButton submitting={loading} onClick={handleDelete} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
