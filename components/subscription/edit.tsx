'use client'

import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { type SubFormData, type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { subscriptionSdk } from '@sdk'
import { Edit } from 'lucide-react'
import { useState, type FormEventHandler } from 'react'
import { useSubs } from './context'
import { SubscriptionForm } from './form'

interface Props {
  sub: Subscription
  className?: string
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
  triggerDecorator?: React.ReactNode
}

const TRIGGER_DECORATOR = <Edit size={12} />

export const SubEdit = ({ sub, className, variant = 'outline', triggerDecorator = TRIGGER_DECORATOR }: Props) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { updateSub } = useSubs()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = Object.fromEntries(new FormData(e.currentTarget)) as unknown as SubFormData

      const updatedSub = await subscriptionSdk.update(
        sub.id,
        formData
      )

      updateSub(updatedSub)
      void subscriptionSdk.revalidate(sub.userId)
      setOpen(false)
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
          <DialogTitle>Edit subscription</DialogTitle>
          <DialogDescription>
            Edit subscription <strong className="font-semibold">{sub.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm sub={sub} onSubmit={handleSubmit} disabled={loading} />
      </DialogContent>
    </Dialog>
  )
}

export const SubscriptionEdit = SubEdit
