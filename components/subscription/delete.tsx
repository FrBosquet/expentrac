'use client'

import { SubmitButton } from '@components/Form'
import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { getUrl } from '@lib/api'
import { cn } from '@lib/utils'
import { type SubscriptionComplete } from '@types'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import { useSubs } from './context'

interface Props {
  sub: SubscriptionComplete
  className?: string
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
  triggerDecorator?: React.ReactNode
  sideEffect?: () => void
}

const TRIGGER_DECORATOR = <Trash size={12} />

export const SubscriptionDelete = ({ sub, className, variant = 'destructive', triggerDecorator = TRIGGER_DECORATOR, sideEffect }: Props) => {
  const { id, name } = sub
  const { removeSub } = useSubs()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    const result = await fetch(getUrl(`/subscription?id=${id}`), {
      method: 'DELETE'
    })

    setLoading(false)
    if (result.ok) {
      removeSub(sub)
      sideEffect?.()
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn('p-2 h-auto', className)} onClick={() => { setOpen(true) }}>{triggerDecorator}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete subscription</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong className="font-semibold">{name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setOpen(false) }}>Cancel</Button>
          <SubmitButton submitting={loading} onClick={handleDelete} variant='destructive'>Delete</SubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
