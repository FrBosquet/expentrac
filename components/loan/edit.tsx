'use client'

import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { cn } from '@lib/utils'
import { loanSdk, loanShareSdk } from '@sdk'
import { type LoanComplete } from '@types'
import { Edit, EditIcon } from 'lucide-react'
import { useState, type FormEventHandler } from 'react'
import { useLoans } from './context'
import { LoanForm } from './form'

interface Props {
  loan: LoanComplete
  className?: string
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
  triggerDecorator?: React.ReactNode
}

const TRIGGER_DECORATOR = <Edit size={12} />

const hasLoanChanged = (loan: LoanComplete, formData: Record<string, FormDataEntryValue>) => {
  const ignoredKeys = ['id', 'shares', 'vendor', 'platform', 'lender', 'userId']

  for (const key in loan) {
    if (ignoredKeys.includes(key)) continue

    const value = loan[key as keyof LoanComplete]
    const formValue = formData[key]

    switch (key) {
      case 'fee':
      case 'initial':
        if (value !== Number(formValue)) return true
        break
      case 'startDate':
      case 'endDate':
        if (new Date(formValue as string).toISOString() !== new Date(value as string).toISOString()) return true
        break
      case 'vendorId':
      case 'platformId':
      case 'lenderId':
        if (!value && formValue === 'NONE') break
        if (value !== formValue) return true
        break
      default:
        if (value !== formValue) return true
        break
    }
  }

  return false
}

export const LoanEdit = ({ loan, className, variant = 'outline', triggerDecorator = TRIGGER_DECORATOR }: Props) => {
  const { updateLoan } = useLoans()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { shares } = loan
      const formData = Object.fromEntries(new FormData(e.currentTarget))

      const sharedWith = Object.keys(formData).reduce<string[]>((acc, key) => {
        if (key.startsWith('sharedWith')) {
          return [...acc, formData[key] as string]
        }
        return acc
      }, [])

      const sharesToRemove = shares.filter((share) => !sharedWith.includes(share.userId))
      const sharesToAdd = sharedWith.filter((userId) => !shares.some((share) => share.userId === userId))

      for (const share of sharesToRemove) {
        await loanShareSdk.delete(share.id)
      }

      if (hasLoanChanged(loan, formData) || sharesToAdd.length) {
        const data = await loanSdk.update({
          id: loan.id,
          ...formData
        })

        updateLoan(data)
      } else {
        const updatedLoan = {
          ...loan,
          shares: shares.filter((share) => sharedWith.includes(share.userId))
        }

        updateLoan(updatedLoan)
      }

      void loanSdk.revalidate(loan.userId)
      setLoading(false)
      setOpen(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn('p-2 h-auto', className)} onClick={() => { setOpen(true) }}>{triggerDecorator}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EditIcon size={12} />
            <span>Edit loan</span>
          </DialogTitle>
          <DialogDescription>
            Edit <strong className="font-semibold">{loan.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <LoanForm loan={loan} onSubmit={handleSubmit} disabled={loading} />
      </DialogContent>
    </Dialog>
  )
}
