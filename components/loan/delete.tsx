'use client'

import { SubmitButton } from "@components/Form"
import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { cn } from "@lib/utils"
import { revalidatUserLoans } from "@services/sdk"
import { LoanComplete } from "@types"
import { Trash } from "lucide-react"
import { useState } from "react"
import { useLoans } from "./Context"

type Props = {
  loan: LoanComplete
  className?: string
  variant?: "outline" | "destructive" | "link" | "default" | "secondary" | "ghost" | null | undefined
  triggerDecorator?: React.ReactNode
  sideEffect?: () => void
}

const TRIGGER_DECORATOR = <Trash size={12} />

export const LoanDelete = ({ loan, className, variant = 'destructive', triggerDecorator = TRIGGER_DECORATOR, sideEffect }: Props) => {
  const { id, name } = loan
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { removeLoan } = useLoans()

  const handleDelete = async () => {
    setLoading(true)

    const result = await fetch(getUrl(`/loan?id=${id}`), {
      method: 'DELETE'
    })

    if (result.ok) {
      sideEffect?.()
      revalidatUserLoans(loan.userId)
      removeLoan(loan)
      setOpen(false)
    } else {
      setLoading(false)
      // TODO: error toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn("p-2 h-auto", className)} onClick={() => setOpen(true)}>{triggerDecorator}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete loan</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <SubmitButton submitting={loading} onClick={handleDelete} />
        </div>
      </DialogContent>
    </Dialog>
  )
}