'use client'

import { SubmitButton } from '@components/Form'
import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { toHTMLInputFormat } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { Edit } from 'lucide-react'
import { useState } from 'react'
import { pauseSubscription } from './actions'
import { useSubs } from './context'

interface Props {
  sub: Subscription
  className?: string
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
  children?: React.ReactNode
}

const TRIGGER_DECORATOR = <Edit size={12} />

export const SubPause = ({ sub, className, variant = 'outline', children = TRIGGER_DECORATOR }: Props) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { updateSub } = useSubs()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      const response = await pauseSubscription(formData)

      updateSub(response)
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
        <Button variant={variant} className={cn('p-2 h-auto', className)} onClick={() => { setOpen(true) }}>{children}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pause subscription</DialogTitle>
          <DialogDescription>
            Pause <strong className="font-semibold">{sub.name}</strong>.
          </DialogDescription>
          <form onSubmit={handleSubmit} className='flex justify-between items-center pt-4'>
            <input type="hidden" name="id" value={sub.id} />
            <div>
              <label htmlFor="date" className='sr-only'>Until</label>
              <input className='bg-slate-800 p-2 rounded-sm scheme-dark' type="date" name="date" defaultValue={toHTMLInputFormat(new Date())} />
            </div>
            <SubmitButton submitting={loading} />
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
