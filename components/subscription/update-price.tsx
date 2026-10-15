'use client'

import { useQueryScope } from '@store'

import { centsToEuros } from '@lib/money'
import { FormField, SubmitButton } from '@components/Form'
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
import { toHTMLInputFormat } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { type Period } from '@lib/models'
import { ButtonVariant } from '@types'
import { DollarSign } from 'lucide-react'
import { useState } from 'react'

interface Props {
  sub: Subscription
  className?: string
  variant?: ButtonVariant
  children?: React.ReactNode
}

const TRIGGER_DECORATOR = (
  <article className="flex items-center gap-2 whitespace-nowrap">
    <DollarSign size={12} /> Change price
  </article>
)

export const SubUpdatePrice = ({
  sub,
  className,
  variant = 'outline',
  children = TRIGGER_DECORATOR
}: Props) => {
  const [open, setOpen] = useState(false)
  const writes = useSubscriptionWrites()
  const mutation = writes.price
  const loading = mutation.isPending

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      await mutation.mutateAsync(formData)

      setOpen(false)
    } catch {
      /* Keep the draft; the mutation displays the error. */
    }
  }

  const lastActivePeriod = sub.periods.all.reduce((acc: Period, period) => {
    const newDate = new Date(period.from)
    const prevDate = new Date(acc.from)

    return newDate > prevDate ? period : acc
  })

  const viewerId = useQueryScope()
  if (sub.userId !== viewerId) return null

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
          aria-label="Change subscription price"
          className={cn('p-2 h-auto', className)}
          variant={variant}
          onClick={() => {
            setOpen(true)
          }}
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {mutation.isError && <p role="alert">{mutation.error.message}</p>}
        <DialogHeader>
          <DialogTitle>Update subscription price</DialogTitle>
          <DialogDescription>
            Change <strong className="font-semibold">{sub.name}</strong> fee.
            This will end the current period and start a new one.
          </DialogDescription>
          <form
            className="grid grid-cols-2 items-center justify-between gap-2 pt-4"
            onSubmit={handleSubmit}
          >
            <input name="id" type="hidden" value={sub.id} />

            <FormField
              required
              defaultValue={toHTMLInputFormat(new Date())}
              label="From"
              name="date"
              type="date"
            />

            <FormField
              required
              className="text-center"
              defaultValue={centsToEuros(lastActivePeriod.feeCents)}
              label="Fee"
              name="fee"
              step="0.01"
              type="number"
            >
              €
            </FormField>

            <SubmitButton className="col-start-2" submitting={loading} />
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
