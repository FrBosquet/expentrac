'use client'

import { FormEventHandler, useState } from "react"
import { Button } from "./Button"
import { NumberField, Root, SubmitButton, TextField } from "./Form"
import { Modal } from "./Modal"

export const LoanAdd = () => {
  const [open, setOpen] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()

    console.log(Object.fromEntries(new FormData(e.currentTarget)))
  }

  return (
    <Modal open={open} onOpenChange={setOpen} title="Add loan" trigger={<Button>Add loan</Button>}>
      <Root onSubmit={handleSubmit}>
        <fieldset>
          <TextField name="name" />
          <NumberField name="fee" />
          <SubmitButton>Add</SubmitButton>
        </fieldset>
      </Root>
    </Modal>
  )
}