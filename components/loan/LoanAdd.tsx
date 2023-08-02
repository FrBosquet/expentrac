'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { useRouter } from "next/navigation"
import { FormEventHandler, useState } from "react"
import { DateField, NumberField, Root, SubmitButton, TextField } from "../Form"

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
        <button className='btn-sm-create' onClick={() => setOpen(true)}>New loan</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add loan</DialogTitle>
          <DialogDescription>
            Track a new loan
          </DialogDescription>
        </DialogHeader>
        <Root onSubmit={handleSubmit}>
          <fieldset disabled={loading}>
            <TextField name="name" />
            <NumberField name="fee" label="monthly fee" />
            <DateField name="startDate" type="date" />
            <DateField name="endDate" type="date" />
            <div className="flex justify-end gap-2 pt-4">
              <SubmitButton className="btn-sm-create">Submit</SubmitButton>
            </div>
          </fieldset>
        </Root>
      </DialogContent>
    </Dialog>
  )
}