'use client'

import { getUrl } from "@lib/api"
import { useRouter } from "next/navigation"
import { FormEventHandler, useState } from "react"
import { DateField, NumberField, Root, SubmitButton, TextField } from "../Form"
import { Close, Modal } from "../Modal"

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
    <Modal open={open} onOpenChange={setOpen} title="Add loan" trigger={<button className='btn-sm-create'>Add loan</button>}>
      <Root onSubmit={handleSubmit}>
        <fieldset disabled={loading}>
          <TextField name="name" />
          <NumberField name="fee" label="monthly fee" />
          <DateField name="startDate" type="date" />
          <DateField name="endDate" type="date" />
          <div className="flex justify-end gap-2 pt-4">
            <Close asChild>
              <button disabled={loading} className='btn-sm-grayed'>Cancel</button>
            </Close>
            <SubmitButton className="btn-sm-create">Submit</SubmitButton>
          </div>
        </fieldset>
      </Root>
    </Modal>
  )
}