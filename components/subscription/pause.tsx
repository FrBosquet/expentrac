'use client'

import { pauseSubscription } from '@app/actions'
import { SubmitButton } from '@app/dashboard/profile/edit/submitButton'
import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { toHTMLInputFormat } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { Edit } from 'lucide-react'
import { useState } from 'react'

interface Props {
  sub: Subscription
  className?: string
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
  children?: React.ReactNode
}

const TRIGGER_DECORATOR = <Edit size={12} />

export const SubPause = ({ sub, className, variant = 'outline', children = TRIGGER_DECORATOR }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn('p-2 h-auto', className)} onClick={() => { setOpen(true) }}>{children}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pause subscription</DialogTitle>
          <DialogDescription>
            Pause <strong className="font-semibold">{sub.name}</strong>.
          </DialogDescription>
          <form action={pauseSubscription}>
            <input type="hidden" name="id" value={sub.id} />
            <input className='bg-slate-800 p-2 rounded-sm scheme-dark' type="date" name="date" defaultValue={toHTMLInputFormat(new Date())} />
            <SubmitButton />
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
