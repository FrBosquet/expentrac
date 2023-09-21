'use client'

import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { cn } from '@lib/utils'
import { subscriptionSdk } from '@services/sdk'
import { subscriptionShareSdk } from '@services/sdk/subscriptionShare'
import { type SubscriptionComplete } from '@types'
import { Edit } from 'lucide-react'
import { useState, type FormEventHandler } from 'react'
import { useSubs } from './context'
import { SubscriptionForm } from './form'

interface Props {
  sub: SubscriptionComplete
  className?: string
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
  triggerDecorator?: React.ReactNode
}

const TRIGGER_DECORATOR = <Edit size={12} />

const hasSubscriptionChanged = (subscription: SubscriptionComplete, formData: Record<string, FormDataEntryValue>) => {
  const ignoredKeys = ['id', 'shares', 'vendor', 'platform', 'lender', 'userId']

  for (const key in subscription) {
    if (ignoredKeys.includes(key)) continue

    const value = subscription[key as keyof SubscriptionComplete]
    const formValue = formData[key]

    switch (key) {
      case 'fee':
        if (value !== Number(formValue)) return true
        break
      case 'vendorId':
      case 'platformId':
        if (!value && formValue === 'NONE') break
        if (value !== formValue) return true
        break
      case 'payday':
        if (Number(formValue) !== value) return true
        break
      default:
        if (value !== formValue) return true
        break
    }
  }

  return false
}

export const SubscriptionEdit = ({ sub, className, variant = 'outline', triggerDecorator = TRIGGER_DECORATOR }: Props) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { updateSub } = useSubs()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { shares } = sub
      const formData = Object.fromEntries(new FormData(e.currentTarget))

      const sharedWith = Object.keys(formData).reduce<string[]>((acc, key) => {
        if (key.startsWith('sharedWith')) {
          return [...acc, formData[key] as string]
        }
        return acc
      }, [])

      const sharesToRemove = shares.filter((share) => !sharedWith.includes(share.userId))
      const sharesToAdd = sharedWith.filter((userId) => !shares.some((share) => share.userId === userId))

      for (const share of sharesToRemove) {
        await subscriptionShareSdk.delete(share.id)
      }

      if (hasSubscriptionChanged(sub, formData) || sharesToAdd.length) {
        const data = await subscriptionSdk.update({
          id: sub.id,
          ...formData
        })

        updateSub(data)
      } else {
        const updatedLoan = {
          ...sub,
          shares: shares.filter((share) => sharedWith.includes(share.userId))
        }

        updateSub(updatedLoan)
      }

      void subscriptionSdk.revalidate(sub.userId)
      setLoading(false)
      setOpen(false)
    } catch (e) {
      console.error(e)
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
