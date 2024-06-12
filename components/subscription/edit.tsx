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
import { type SubFormData, type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { subscriptionSdk } from '@sdk'
import { ButtonVariant } from '@types'
import { Edit } from 'lucide-react'
import { type FormEventHandler, useState } from 'react'

import { useSubs } from './context'
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
  const { updateSub } = useSubs()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = Object.fromEntries(
        new FormData(e.currentTarget)
      ) as unknown as SubFormData

      const updatedSub = await subscriptionSdk.update(sub.id, formData)

      updateSub(updatedSub)
      void subscriptionSdk.revalidate(sub.userId)
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
