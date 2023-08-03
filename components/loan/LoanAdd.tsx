'use client'

import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { useRouter } from "next/navigation"
import { FormEventHandler, useState } from "react"
import { FieldSet, FormField, Root, SubmitButton } from "../Form"

export const LoanAdd = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await fetch(getUrl(`/loan`), {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
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
        <Button variant="outline" className="text-xs h-auto" onClick={() => setOpen(true)}>New loan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add loan</DialogTitle>
          <DialogDescription>
            Track a new loan
          </DialogDescription>
        </DialogHeader>
        <Root onSubmit={handleSubmit}>
          <FieldSet disabled={loading}>
            <FormField required name="name" label="Name" />
            <FormField required name="fee" label="Fee" type="number" step="0.01" />
            <FormField required name="startDate" label="Start date" type="date" />
            <FormField required name="endDate" label="End date" type="date" />

            <div className="flex justify-end gap-2 pt-4 col-span-2">
              <SubmitButton submitting={loading} />
            </div>
          </FieldSet>
        </Root>
      </DialogContent>
    </Dialog>
  )
}