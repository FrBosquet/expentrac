'use client'

import { Brand, BrandAutocomplete } from "@components/BrandAutocomplete"
import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const ProviderAdd = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (brand: Brand) => {
    setLoading(true)

    const result = await fetch(getUrl(`/user-provider`), {
      method: 'POST',
      body: JSON.stringify(brand)
    })

    const { data } = await result.json() as { data: Brand }

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
        <BrandAutocomplete loading={loading} onSelect={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}