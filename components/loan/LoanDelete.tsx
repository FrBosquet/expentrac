'use client'

import { SubmitButton } from "@components/Form"
import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { Loan } from "@prisma/client"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  loan: Loan
}

export const LoanDelete = ({ loan }: Props) => {
  const { id, name } = loan
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    setOpen(false)

    const result = await fetch(getUrl(`/loan?id=${id}`), {
      method: 'DELETE'
    })

    if (result.ok) {
      router.refresh()
    } else {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='destructive' className="p-2 h-auto" onClick={() => setOpen(true)}><Trash size={12} /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete loan</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{loan.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <SubmitButton submitting={loading} />
        </div>
      </DialogContent>
    </Dialog>
  )
}