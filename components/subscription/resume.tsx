'use client'

import { FormField, SubmitButton } from '@components/Form'
import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { toHTMLInputFormat } from '@lib/dates'
import { type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { type Period } from '@prisma/client'
import { Play } from 'lucide-react'
import { useState } from 'react'
import { resumeSubscription } from './actions'
import { useSubs } from './context'
import { SubscriptionFormPeriodicity } from './form'

interface Props {
  sub: Subscription
  className?: string
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
  children?: React.ReactNode
}

const TRIGGER_DECORATOR = <article className='flex items-center gap-2'><Play size={12} /> Resume</article>

export const SubResume = ({ sub, className, variant = 'outline', children = TRIGGER_DECORATOR }: Props) => {
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
        <Button variant={variant} className={cn('p-2 h-auto', className)} onClick={() => { setOpen(true) }}>{children}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resume subscription</DialogTitle>
          <DialogDescription>
            Resume <strong className="font-semibold">{sub.name}</strong>.
          </DialogDescription>
          <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-2 justify-between items-center'>
            <input type="hidden" name="id" value={sub.id} />

            <FormField label="From" required type="date" name="date" defaultValue={toHTMLInputFormat(new Date())} />

            <FormField required defaultValue={lastActivePeriod.fee} name="fee" label="Fee" type="number" step="0.01" className='text-center'>€</FormField>

            <SubscriptionFormPeriodicity sub={sub} />

            <SubmitButton className='col-start-2' submitting={loading} />
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
