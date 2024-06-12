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
import { useUser } from '@components/user/hooks'
import { type SubFormData } from '@lib/sub'
import { subscriptionSdk } from '@sdk'
import { type FormEventHandler, useState } from 'react'

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
      const formData = Object.fromEntries(
        new FormData(e.currentTarget)
      ) as unknown as SubFormData

      const sub = await subscriptionSdk.create(formData)

      void subscriptionSdk.revalidate(user.id)
      setOpen(false)
      addSub(sub)
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
          className="h-auto text-xs"
          variant="outline"
          onClick={() => {
            setOpen(true)
          }}
        >
          New subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New subscription</DialogTitle>
          <DialogDescription>Track a new subscription</DialogDescription>
        </DialogHeader>
        <SubscriptionForm disabled={loading} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
