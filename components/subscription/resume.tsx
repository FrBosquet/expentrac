'use client'

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
import { toHTMLInputFormat } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { type Period } from '@prisma/client'
import { ButtonVariant } from '@types'
import { Play } from 'lucide-react'
import { useState } from 'react'

import { resumeSubscription } from './actions'
import { useSubs } from './context'
import { SubscriptionFormPeriodicity } from './form'

interface Props {
  sub: Subscription
  className?: string
  variant?: ButtonVariant
  children?: React.ReactNode
}

const TRIGGER_DECORATOR = (
  <article className="flex items-center gap-2">
    <Play size={12} /> Resume
  </article>
)

export const SubResume = ({
  sub,
  className,
  variant = 'outline',
  children = TRIGGER_DECORATOR
}: Props) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { updateSub } = useSubs()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      const response = await resumeSubscription(formData)

      updateSub(response)
      setOpen(false)
    } catch (e) {
      // TODO: toast
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const lastActivePeriod = sub.periods.all.reduce((acc: Period, period) => {
    const newDate = new Date(period.from)
    const prevDate = new Date(acc.from)

    return newDate > prevDate ? period : acc
  })

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
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resume subscription</DialogTitle>
          <DialogDescription>
            Resume <strong className="font-semibold">{sub.name}</strong>.
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
              defaultValue={lastActivePeriod.fee}
              label="Fee"
              name="fee"
              step="0.01"
              type="number"
            >
              €
            </FormField>

            <SubscriptionFormPeriodicity sub={sub} />

            <SubmitButton className="col-start-2" submitting={loading} />
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
