'use client'

import { useUser } from '@components/Provider'
import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { getUrl } from '@lib/api'
import { revalidatUserLoans } from '@services/sdk'
import { type LoanComplete } from '@types'
import { useState, type FormEventHandler } from 'react'
import { useLoans } from './Context'
import { LoanForm } from './form'

export const LoanAdd = () => {
  const { user } = useUser()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addLoan } = useLoans()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await fetch(getUrl('/loan'), {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
    })

    const { data } = await result.json() as { data: LoanComplete }

    if (result.ok) {
      void revalidatUserLoans(user.id)
      setOpen(false)
      addLoan(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs h-auto" onClick={() => { setOpen(true) }}>New loan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add loan</DialogTitle>
          <DialogDescription>
            Track a new loan
          </DialogDescription>
        </DialogHeader>
        <LoanForm onSubmit={handleSubmit} disabled={loading} />
      </DialogContent>
    </Dialog>
  )
}
