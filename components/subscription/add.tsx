'use client'

import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { Subscription } from "@prisma/client"
import { FormEventHandler, useState } from "react"
import { useSubs } from "./context"
import { SubscriptionForm } from "./form"

export const SubscriptionAdd = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addSub } = useSubs()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await fetch(getUrl(`/subscription`), {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
    })

    const { data } = await result.json() as { data: Subscription }

    setLoading(false)
    if (result.ok) {
      setOpen(false)
      addSub(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className="text-xs h-auto" onClick={() => setOpen(true)}>New subscription</Button>
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