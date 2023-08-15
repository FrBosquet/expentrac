'use client'

import { Button } from "@components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog"
import { getUrl } from "@lib/api"
import { cn } from "@lib/utils"
import { UserProvider } from "@prisma/client"
import { LoanComplete } from "@types"
import { Edit, EditIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormEventHandler, useState } from "react"
import { LoanForm } from "./Form"

type Props = {
  loan: LoanComplete
  className?: string
  variant?: "outline" | "destructive" | "link" | "default" | "secondary" | "ghost" | null | undefined
  triggerDecorator?: React.ReactNode
  userProviders: UserProvider[]
}

const TRIGGER_DECORATOR = <Edit size={12} />

export const LoanEdit = ({ loan, className, variant = 'outline', triggerDecorator = TRIGGER_DECORATOR, userProviders }: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await fetch(getUrl(`/loan`), {
      method: 'PATCH',
      body: JSON.stringify({
        id: loan.id,
        ...Object.fromEntries(new FormData(e.currentTarget))
      })
    })
    setLoading(false)

    if (result.ok) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn("p-2 h-auto", className)} onClick={() => setOpen(true)}>{triggerDecorator}</Button>
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
        <LoanForm loan={loan} onSubmit={handleSubmit} disabled={loading} userProviders={userProviders as any} />
      </DialogContent>
    </Dialog>
  )
}