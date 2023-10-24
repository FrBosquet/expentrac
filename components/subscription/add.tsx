'use client'

import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { useUser } from '@components/user/hooks'
import { type SubFormData } from '@lib/sub'
import { subscriptionSdk } from '@sdk'
import { useState, type FormEventHandler } from 'react'
import { useSubs } from './context'
import { SubscriptionForm } from './form'

export const SubscriptionAdd = () => {
  const { user } = useUser()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addSub } = useSubs()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = Object.fromEntries(new FormData(e.currentTarget)) as unknown as SubFormData
      const sub = await subscriptionSdk.create(formData)

      void subscriptionSdk.revalidate(user.id)
      setOpen(false)
      addSub(sub)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className="text-xs h-auto" onClick={() => { setOpen(true) }}>New subscription</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New subscription</DialogTitle>
          <DialogDescription>
            Track a new subscription
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm onSubmit={handleSubmit} disabled={loading} />
      </DialogContent>
    </Dialog>
  )
}
