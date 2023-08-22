'use client'

import { Brand, BrandAutocomplete } from "@components/BrandAutocomplete"
import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { addUserProvider } from "@services/sdk"
import { UserProviderComplete } from "@types"
import { useState } from "react"
import { useProviders } from "./context"

export const ProviderDialog = ({
  children,
  open,
  setOpen,
  sideEffect
}: {
  children?: React.ReactNode
  open: boolean
  setOpen: (open: boolean) => void
  sideEffect?: (userProvider: UserProviderComplete) => void
}) => {
  const { addProvider } = useProviders()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (brand: Brand) => {
    try {
      setLoading(true)

      const userProvider = await addUserProvider(brand)

      addProvider(userProvider)

      sideEffect?.(userProvider)
      setOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    {children}
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
}

export const ProviderAdd = () => {
  const [open, setOpen] = useState(false)

  return <ProviderDialog open={open} setOpen={setOpen}>
    <DialogTrigger asChild>
      <Button variant="outline" className="text-xs h-auto" onClick={() => setOpen(true)}>New provider</Button>
    </DialogTrigger>
  </ProviderDialog>
}