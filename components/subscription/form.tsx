'use client'

import { useProviders } from "@components/provider/context"
import { ProviderSelect } from "@components/provider/select"
import { Label } from "@components/ui/label"
import { Separator } from "@components/ui/separator"
import { Subscription } from "@prisma/client"
import { FormEventHandler } from "react"
import { FieldSet, FormField, Root, SubmitButton } from "../Form"

type Props = {
  sub?: Subscription
  onSubmit: FormEventHandler<HTMLFormElement>
  disabled?: boolean
}

export const SubscriptionForm = ({ sub, onSubmit, disabled = false }: Props) => {
  const { providers } = useProviders()

  const brandOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.provider.name
  }))

  return <Root onSubmit={onSubmit}>
    <FieldSet disabled={disabled}>
      <FormField required defaultValue={sub?.name} name="name" label="Name" />
      <FormField required defaultValue={sub?.fee} name="fee" label="Fee" type="number" step="0.01" />

      <div className="col-span-2 grid grid-cols-2 gap-2">
        <span className="flex flex-col gap-2">
          <Label htmlFor='vendorId' className="text-xs text-center">
            Vendor
          </Label>
          <ProviderSelect required name="vendorId" items={brandOptions} defaultValue={sub?.vendorId} />
        </span>

        <span className="flex flex-col gap-2">
          <Label htmlFor='platformId' className="text-xs text-center">
            Platform
          </Label>
          <ProviderSelect required name="platformId" items={brandOptions} defaultValue={sub?.platformId} />
        </span>
      </div>

      <Separator className="col-span-2" />

      <div className="flex justify-end gap-2 pt-4 col-span-2">
        <SubmitButton submitting={disabled} />
      </div>
    </FieldSet>
  </Root>
}