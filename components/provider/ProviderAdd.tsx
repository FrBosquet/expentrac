'use client'

import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { useRouter } from "next/navigation"
import { FormEventHandler, useState } from "react"
import { FieldSet, FormField, Root, SubmitButton } from "../Form"

export const ProviderAdd = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await fetch(getUrl(`/user-provider`), {
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
        <Button variant="outline" className="text-xs h-auto" onClick={() => setOpen(true)}>New provider</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a provider</DialogTitle>
          <DialogDescription>
            Add a new provider to yout list
          </DialogDescription>
        </DialogHeader>
        <Root onSubmit={handleSubmit}>
          <FieldSet disabled={loading}>
            <FormField required name="name" label="Name" />

            <div className="flex justify-end gap-2 pt-4 col-span-2">
              <SubmitButton submitting={loading} />
            </div>
          </FieldSet>
        </Root>
      </DialogContent>
    </Dialog>
  )
}