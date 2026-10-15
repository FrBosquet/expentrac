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
import { useSubscriptionWrites } from '@hooks/resources'
import { toHTMLInputFormat } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { ButtonVariant } from '@types'
import { Edit } from 'lucide-react'
import { useState } from 'react'

interface Props {
  sub: Subscription
  className?: string
  variant?: ButtonVariant
  children?: React.ReactNode
}

const TRIGGER_DECORATOR = <Edit size={12} />

export const SubPause = ({
  sub,
  className,
  variant = 'outline',
  children = TRIGGER_DECORATOR
}: Props) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const writes = useSubscriptionWrites()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      await writes.pause(formData)

      setOpen(false)
    } catch (e) {
      // TODO: toast
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const viewerId = useQueryScope()
  if (sub.userId !== viewerId) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Pause subscription"
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
          <DialogTitle>Pause subscription</DialogTitle>
          <DialogDescription>
            Pause <strong className="font-semibold">{sub.name}</strong>.
          </DialogDescription>
          <form
            className="flex items-center justify-between pt-4"
            onSubmit={handleSubmit}
          >
            <input name="id" type="hidden" value={sub.id} />
            <div>
              <label className="sr-only" htmlFor="date">
                Until
              </label>
              <input
                className="rounded-xs bg-slate-800 p-2 scheme-dark"
                defaultValue={toHTMLInputFormat(new Date())}
                name="date"
                type="date"
              />
            </div>
            <SubmitButton submitting={loading} />
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
