'use client'

import { useQueryScope } from '@store'

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
import { type SubFormData, type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { ButtonVariant } from '@types'
import { Edit } from 'lucide-react'
import { type FormEventHandler, useState } from 'react'

import { SubscriptionForm } from './form'

interface Props {
  sub: Subscription
  className?: string
  variant?: ButtonVariant
  triggerDecorator?: React.ReactNode
}

const TRIGGER_DECORATOR = <Edit size={12} />

export const SubEdit = ({
  sub,
  className,
  variant = 'outline',
  triggerDecorator = TRIGGER_DECORATOR
}: Props) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const writes = useSubscriptionWrites()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = Object.fromEntries(
        new FormData(e.currentTarget)
      ) as unknown as SubFormData

      await writes.update(sub.id, formData)

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
          className={cn('p-2 h-auto', className)}
          aria-label="Edit subscription"
          disabled={!sub.periods.isActive}
          title={
            sub.periods.isActive
              ? 'Edit subscription'
              : 'Resume before editing billing settings'
          }
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
          <DialogTitle>Edit subscription</DialogTitle>
          <DialogDescription>
            Edit subscription{' '}
            <strong className="font-semibold">{sub.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm
          disabled={loading}
          sub={sub}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

export const SubscriptionEdit = SubEdit
