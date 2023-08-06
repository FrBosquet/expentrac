'use client'

import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { toHTMLInputFormat } from "@lib/dates"
import { cn } from "@lib/utils"
import { Loan } from "@prisma/client"
import { Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormEventHandler, useState } from "react"
import { FieldSet, FormField, Root, SubmitButton } from "../Form"

type Props = {
  loan: Loan
  className?: string
  variant?: "outline" | "destructive" | "link" | "default" | "secondary" | "ghost" | null | undefined
  triggerDecorator?: React.ReactNode
}

const TRIGGER_DECORATOR = <Edit size={12} />

export const LoanEdit = ({ loan, className, variant = 'outline', triggerDecorator = TRIGGER_DECORATOR }: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await fetch(getUrl(`/loan`), {
      method: 'PATCH',
      body: JSON.stringify({
        id: loan.id,
        ...Object.fromEntries(new FormData(e.currentTarget))
      })
    })
    setLoading(false)

    if (result.ok) {
      setOpen(false)
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
          <DialogTitle>Edit loan</DialogTitle>
          <DialogDescription>
            Edit loan <strong>{loan.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Root onSubmit={handleSubmit}>
          <FieldSet disabled={loading}>
            <FormField required defaultValue={loan.name} name="name" label="Name" />
            <FormField required defaultValue={loan.fee} name="fee" label="Fee" type="number" step="0.01" />
            <FormField required defaultValue={toHTMLInputFormat(loan.startDate)} name="startDate" label="Start date" type="date" />
            <FormField required defaultValue={toHTMLInputFormat(loan.endDate)} name="endDate" label="End date" type="date" />

            <div className="flex justify-end gap-2 pt-4 col-span-2">
              <SubmitButton submitting={loading} />
            </div>
          </FieldSet>
        </Root>
      </DialogContent>
    </Dialog>
  )
}