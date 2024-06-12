'use client'

import { SubmitButton } from '@components/Form'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog'
import { type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { subscriptionSdk } from '@sdk'
import { ButtonVariant } from '@types'
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useSubs } from './context'

interface Props {
  sub: Subscription
  className?: string
  variant?: ButtonVariant
  children?: React.ReactNode
  afterDeleteUrl?: string
}

const TRIGGER_DECORATOR = <Trash size={12} />

export const SubDelete = ({
  sub,
  className,
  variant = 'destructive',
  children = TRIGGER_DECORATOR,
  afterDeleteUrl
}: Props) => {
  const { id, name } = sub
  const { removeSub } = useSubs()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { push } = useRouter()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const result = await subscriptionSdk.delete(id)

      removeSub(result)
      void subscriptionSdk.revalidate(sub.userId)

      setOpen(false)

      if (afterDeleteUrl) push(afterDeleteUrl)
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
      <DialogTrigger asChild>
        <Button
          className={cn('p-2 h-auto', className)}
          variant={variant}
          onClick={() => {
            setOpen(true)
          }}
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete subscription</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <strong className="font-semibold">{name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
            }}
          >
            Cancel
          </Button>
          <SubmitButton
            submitting={loading}
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </SubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
