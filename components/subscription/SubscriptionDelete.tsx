'use client'

import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { cn } from "@lib/utils"
import { Subscription } from "@prisma/client"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  sub: Subscription
  className?: string
  variant?: "outline" | "destructive" | "link" | "default" | "secondary" | "ghost" | null | undefined
  triggerDecorator?: React.ReactNode
  sideEffect?: () => void
}

const TRIGGER_DECORATOR = <Trash size={12} />

export const SubscriptionDelete = ({ sub, className, variant = 'destructive', triggerDecorator = TRIGGER_DECORATOR, sideEffect }: Props) => {
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
    if (result.ok) {
      setOpen(false)
      sideEffect?.()
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn("p-2 h-auto", className)} onClick={() => setOpen(true)}>{triggerDecorator}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete subscription</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <button disabled={loading} onClick={() => setOpen(false)}>Cancel</button>
          <button disabled={loading} onClick={handleDelete}>Delete</button>
        </div>
      </DialogContent>
    </Dialog>
  )
}