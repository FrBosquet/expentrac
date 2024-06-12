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
import { useUser } from '@components/user/hooks'
import { type LoanFormData } from '@lib/loan'
import { loanSdk } from '@sdk'
import { PlusIcon } from 'lucide-react'
import { type FormEventHandler, useState } from 'react'

import { useLoans } from './context'
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
  const { user } = useUser()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addLoan } = useLoans()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = Object.fromEntries(
        new FormData(e.currentTarget)
      ) as unknown as LoanFormData
      const loan = await loanSdk.create(formData)

      void loanSdk.revalidate(user.id)
      setOpen(false)
      addLoan(loan)
    } catch (err) {
      // TODO: toast
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <DialogHeader>
          <DialogTitle>Add loan</DialogTitle>
          <DialogDescription>Track a new loan</DialogDescription>
        </DialogHeader>
        <LoanForm disabled={loading} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
