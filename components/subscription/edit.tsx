'use client'

import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { getUrl } from '@lib/api'
import { cn } from '@lib/utils'
import { type Subscription } from '@prisma/client'
import { Edit } from 'lucide-react'
import { type FormEventHandler, useState } from 'react'
import { useSubs } from './context'
import { SubscriptionForm } from './form'

interface Props {
  sub: Subscription
  className?: string
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
  triggerDecorator?: React.ReactNode
}

const TRIGGER_DECORATOR = <Edit size={12} />

export const SubscriptionEdit = ({ sub, className, variant = 'outline', triggerDecorator = TRIGGER_DECORATOR }: Props) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { updateSub } = useSubs()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await fetch(getUrl('/subscription'), {
      method: 'PATCH',
      body: JSON.stringify({
        id: sub.id,
        ...Object.fromEntries(new FormData(e.currentTarget))
      })
    })

    const { data } = await result.json() as { data: Subscription }

    setLoading(false)
    if (result.ok) {
      setOpen(false)
      updateSub(data)
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
