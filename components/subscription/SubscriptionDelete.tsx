'use client'

import { getUrl } from "@lib/api"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Modal } from "../Modal"
import { Subscription } from "@prisma/client"

type Props = {
  sub: Subscription
}

export const SubscriptionDelete = ({ sub }: Props) => {
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

    console.log(result)

    if (result.ok) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Modal open={open} onOpenChange={setOpen} title="Delete subscription" trigger={<button className='btn-sm-destroy' onClick={() => setOpen(true)}>Delete</button>}>
      <p className="py-4">Are you sure you want to delete <strong>{name}</strong></p>
      <div className="flex justify-end gap-2">
        <button disabled={loading} className='btn-sm-grayed' onClick={() => setOpen(false)}>Cancel</button>
        <button disabled={loading} className='btn-sm-destroy' onClick={handleDelete}>Delete</button>
      </div>
    </Modal>
  )
}