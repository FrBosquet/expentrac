'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { Subscription } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  sub: Subscription
}

export const SubscriptionDelete = ({ sub }: Props) => {
  const { id, name } = sub
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    const result = await fetch(getUrl(`/subscription?id=${id}`), {
      method: 'DELETE'
    })
    setLoading(false)

    console.log(result)

    if (result.ok) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className='btn-sm-destroy' onClick={() => setOpen(true)}>Delete</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete subscription</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <button disabled={loading} className='btn-sm-grayed' onClick={() => setOpen(false)}>Cancel</button>
          <button disabled={loading} className='btn-sm-destroy' onClick={handleDelete}>Delete</button>
        </div>
      </DialogContent>
    </Dialog>
  )
}