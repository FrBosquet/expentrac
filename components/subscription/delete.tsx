'use client'

import { useQueryScope } from '@store'

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
import { useSubscriptionWrites } from '@hooks/resources'
import { type Subscription } from '@lib/sub'
import { cn } from '@lib/utils'
import { ButtonVariant } from '@types'
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
  const writes = useSubscriptionWrites()
  const mutation = writes.remove
  const loading = mutation.isPending
  const [open, setOpen] = useState(false)
  const { push } = useRouter()

  const handleDelete = async () => {
    try {
      await mutation.mutateAsync(id)

      setOpen(false)

      if (afterDeleteUrl) push(afterDeleteUrl)
    } catch {
      /* Keep the draft; the mutation displays the error. */
    }
  }

  const viewerId = useQueryScope()
  if (sub.userId !== viewerId) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          mutation.reset()
          setOpen(value)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          aria-label="Delete subscription"
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
        {mutation.isError && <p role="alert">{mutation.error.message}</p>}
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
