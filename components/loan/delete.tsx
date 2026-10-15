'use client'

import { useQueryScope } from '@store'

import { SubmitButton } from '@components/Form'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog'
import { useLoanWrites } from '@hooks/resources'
import { type Loan } from '@lib/loan'
import { cn } from '@lib/utils'
import { ButtonVariant } from '@types'
import { Trash } from 'lucide-react'
import { useState } from 'react'

interface Props {
  loan: Loan
  className?: string
  variant?: ButtonVariant
  triggerDecorator?: React.ReactNode
  sideEffect?: () => Promise<void>
}

const TRIGGER_DECORATOR = <Trash size={12} />

export const LoanDelete = ({
  loan,
  className,
  variant = 'destructive',
  triggerDecorator = TRIGGER_DECORATOR,
  sideEffect
}: Props) => {
  const { id, name } = loan
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const writes = useLoanWrites()

  const handleDelete = async () => {
    setLoading(true)

    try {
      await writes.remove(id)

      setOpen(false)
      void sideEffect?.()
    } catch (e) {
      // TODO: toast
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const viewerId = useQueryScope()
  if (loan.userId !== viewerId) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Delete loan"
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
