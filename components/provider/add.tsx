'use client'

import { type Brand, BrandAutocomplete } from '@components/BrandAutocomplete'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog'
import { type Provider } from '@lib/prisma'
import { cn } from '@lib/utils'
import { providerSdk } from '@sdk/provider'
import { useState } from 'react'

export const ProviderDialog = ({
  children,
  open,
  setOpen,
  sideEffect
}: {
  children?: React.ReactNode
  open: boolean
  setOpen: (open: boolean) => void
  sideEffect?: (userProvider: Provider) => void
}) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (brand: Brand) => {
    try {
      setLoading(true)

      const provider = await providerSdk.add(brand)

      sideEffect?.(provider)
      setOpen(false)
    } catch (e) {
      // TODO: toast
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a provider</DialogTitle>
          <DialogDescription>Add a new provider to yout list</DialogDescription>
        </DialogHeader>
        <BrandAutocomplete loading={loading} onSelect={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}

interface Props {
  children?: React.ReactNode
  className?: string
}

export const ProviderAdd = ({
  children = 'New provider',
  className
}: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <ProviderDialog open={open} setOpen={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn('text-xs h-auto', className)}
          variant="outline"
          onClick={() => {
            setOpen(true)
          }}
        >
          {children}
        </Button>
      </DialogTrigger>
    </ProviderDialog>
  )
}
