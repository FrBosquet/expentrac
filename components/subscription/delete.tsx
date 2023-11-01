'use client'

import { SubmitButton } from '@components/Form'
import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { subscriptionSdk } from '@sdk'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import { useSubs } from './context'

interface Props {
  sub: Subscription
  className?: string
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
  triggerDecorator?: React.ReactNode
  sideEffect?: () => void
}

const TRIGGER_DECORATOR = <Trash size={12} />
// TODO: trigger decorator should be a children

export const SubDelete = ({ sub, className, variant = 'destructive', triggerDecorator = TRIGGER_DECORATOR, sideEffect }: Props) => {
  const { id, name } = sub
  const { removeSub } = useSubs()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const result = await subscriptionSdk.delete(id)

      removeSub(result)
      void subscriptionSdk.revalidate(sub.userId)

      setOpen(false)
      void sideEffect?.()
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
