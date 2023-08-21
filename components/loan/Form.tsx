'use client'

import { ProviderSelect } from "@components/ProviderSelect"
import { useProviders } from "@components/provider/context"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Separator } from "@components/ui/separator"
import { toHTMLInputFormat } from "@lib/dates"
import { Loan } from "@prisma/client"
import { FormEventHandler } from "react"
import { FieldSet, FormField, Root, SubmitButton } from "../Form"

type Props = {
  loan?: Loan
  onSubmit: FormEventHandler<HTMLFormElement>
  disabled?: boolean
}

export const LoanForm = ({ loan, onSubmit, disabled = false }: Props) => {
  const { providers } = useProviders()

  const brandOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.provider.name
  }))


  return <Root onSubmit={onSubmit}>
    <FieldSet disabled={disabled}>
      <FormField required defaultValue={loan?.name} name="name" label="Name" />
      <FormField required defaultValue={loan?.fee} name="fee" label="Fee" type="number" step="0.01" />

      <div className="col-span-2 grid grid-cols-3 gap-2">
        <span className="flex flex-col gap-2">
          <Label htmlFor='vendorId' className="text-xs text-center">
            Vendor
          </Label>
          <ProviderSelect required name="vendorId" items={brandOptions} defaultValue={loan?.vendorId} />
        </span>

        <span className="flex flex-col gap-2">
          <Label htmlFor='platformId' className="text-xs text-center">
            Platform
          </Label>
          <ProviderSelect required name="platformId" items={brandOptions} defaultValue={loan?.platformId} />
        </span>

        <span className="flex flex-col gap-2">
          <Label htmlFor='lenderId' className="text-xs text-center">
            Lender
          </Label>
          <ProviderSelect required name="lenderId" items={brandOptions} defaultValue={loan?.lenderId} />
        </span>

      </div>

      <Separator className="col-span-2" />
      <div className="col-span-2 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 items-center">
          <Label htmlFor='startDate' className="text-xs">
            Start date
          </Label>
          <Input id="startDate" name="startDate" required defaultValue={loan ? toHTMLInputFormat(loan.startDate) : undefined} type="date" />
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Label htmlFor='endDate' className="text-xs">
            End date
          </Label>
          <Input id="endDate" name="endDate" required defaultValue={loan ? toHTMLInputFormat(loan.endDate) : undefined} type="date" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 col-span-2">
        <SubmitButton submitting={disabled} />
      </div>
    </FieldSet>
  </Root>
}