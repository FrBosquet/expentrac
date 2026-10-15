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
import { useSubscriptionWrites } from '@hooks/resources'
import { type SubFormData } from '@lib/sub'
import { type FormEventHandler, useState } from 'react'

import { SubscriptionForm } from './form'

export const SubscriptionAdd = () => {
  const [open, setOpen] = useState(false)
  const writes = useSubscriptionWrites()
  const mutation = writes.create
  const loading = mutation.isPending

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    try {
      const formData = Object.fromEntries(
        new FormData(e.currentTarget)
      ) as unknown as SubFormData

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
          className="h-auto text-xs"
          variant="outline"
          onClick={() => {
            setOpen(true)
          }}
        >
          New subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {mutation.isError && <p role="alert">{mutation.error.message}</p>}
        <DialogHeader>
          <DialogTitle>New subscription</DialogTitle>
          <DialogDescription>Track a new subscription</DialogDescription>
        </DialogHeader>
        <SubscriptionForm disabled={loading} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
