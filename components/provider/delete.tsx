'use client'

import { SubmitButton } from "@components/Form"
import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { cn } from "@lib/utils"
import { revalidateUserProviders } from "@services/sdk"
import { UserProviderComplete } from "@types"
import { Trash } from "lucide-react"
import { useState } from "react"
import { useProviders } from "./context"

type Props = {
  userProvider: UserProviderComplete
  className?: string
  variant?: "outline" | "destructive" | "link" | "default" | "secondary" | "ghost" | null | undefined
  triggerDecorator?: React.ReactNode
  sideEffect?: () => void,
  disabled?: boolean
}

const TRIGGER_DECORATOR = <Trash size={12} />

export const ProviderDelete = ({ userProvider, className, variant = 'destructive', triggerDecorator = TRIGGER_DECORATOR, sideEffect, disabled }: Props) => {
  const { id, provider: { name } } = userProvider
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { removeProvider } = useProviders()

  const handleDelete = async () => {
    setLoading(true)

    const result = await fetch(getUrl(`/user-provider?id=${id}`), {
      method: 'DELETE'
    })

    if (result.ok) {
      sideEffect?.()
      revalidateUserProviders(userProvider.userId)
      removeProvider(userProvider)
      setOpen(false)
    } else {
      setLoading(false)
      // TODO: error toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant={variant} className={cn("p-2 h-auto", className)} onClick={() => setOpen(true)}>{triggerDecorator}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete provider</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your connection to <strong>{name}</strong>? You can always reconnect later.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <SubmitButton submitting={loading} onClick={handleDelete} />
        </div>
      </DialogContent>
    </Dialog>
  )
}