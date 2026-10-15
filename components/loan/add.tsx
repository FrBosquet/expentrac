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
import { useLoanWrites } from '@hooks/resources'
import { type LoanFormData } from '@lib/loan'
import { PlusIcon } from 'lucide-react'
import { type FormEventHandler, useState } from 'react'

import { LoanForm } from './form'

const TRIGGER_DECORATOR = () => (
  <span className="flex items-center gap-2 ">
    <PlusIcon size={12} /> NEW LOAN
  </span>
)

interface Props {
  triggerDecorator?: React.ReactNode
}

export const LoanAdd = ({ triggerDecorator = TRIGGER_DECORATOR() }: Props) => {
  const [open, setOpen] = useState(false)
  const writes = useLoanWrites()
  const mutation = writes.create
  const loading = mutation.isPending

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    try {
      const formData = Object.fromEntries(
        new FormData(e.currentTarget)
      ) as unknown as LoanFormData
      await mutation.mutateAsync(formData)

      setOpen(false)
    } catch {
      /* Keep the draft; the mutation displays the error. */
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          mutation.reset()
          setOpen(value)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="h-auto w-fit text-xs"
          variant="outline"
          onClick={() => {
            setOpen(true)
          }}
        >
          {triggerDecorator}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {mutation.isError && <p role="alert">{mutation.error.message}</p>}
        <DialogHeader>
          <DialogTitle>Add loan</DialogTitle>
          <DialogDescription>Track a new loan</DialogDescription>
        </DialogHeader>
        <LoanForm disabled={loading} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
