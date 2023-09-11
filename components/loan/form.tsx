'use client'

import { ProviderSelect } from '@components/ProviderSelect'
import { useProviders } from '@components/provider/context'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Separator } from '@components/ui/separator'
import { euroFormatter } from '@lib/currency'
import { toHTMLInputFormat } from '@lib/dates'
import { getPaymentPlan } from '@lib/loan'
import { type Loan } from '@prisma/client'
import { useMemo, useState, type ChangeEvent, type FormEventHandler } from 'react'
import { FieldSet, FormField, Root, SubmitButton } from '../Form'

interface Props {
  loan?: Loan
  onSubmit: FormEventHandler<HTMLFormElement>
  disabled?: boolean
}

export const LoanForm = ({ loan, onSubmit, disabled = false }: Props) => {
  const [formState, setFormState] = useState<Partial<Loan>>(loan ?? {
    startDate: new Date()
  })

  const { providers } = useProviders()

  const brandOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.provider.name
  }))

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target
    const value = target.value
    const name = target.name

    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculatedFee = useMemo(() => {
    if (!formState.fee || !formState.endDate) return null

    const { startDate, endDate, fee, initial } = formState

    return getPaymentPlan(startDate as Date, endDate, fee, initial)
  }, [formState])

  return <Root onSubmit={onSubmit}>
    <FieldSet disabled={disabled}>
      <FormField required defaultValue={loan?.name} name="name" label="Name" />
      <FormField required defaultValue={loan?.fee} name="fee" label="Fee" type="number" step="0.01" className='text-right' onChange={handleChange}>€</FormField>
      <FormField required defaultValue={loan?.initial ?? 0} name="initial" label="Initial" type="number" step="0.01" className='text-right' onChange={handleChange}>€</FormField>

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
          <Input id="startDate" name="startDate" required defaultValue={toHTMLInputFormat(formState.startDate as Date)} onChange={handleChange} type="date" />
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Label htmlFor='endDate' className="text-xs">
            End date
          </Label>
          <Input id="endDate" name="endDate" required defaultValue={loan ? toHTMLInputFormat(loan.endDate) : undefined} onChange={handleChange} type="date" />
        </div>
      </div>

      {calculatedFee && <>
        <Separator className="col-span-2" />

        <div className='col-span-2 text-xs'>
          you are going to pay {euroFormatter.format(calculatedFee.totalAmount)} in {calculatedFee.payments} months
        </div>
      </>}

      <div className="flex justify-end gap-2 pt-4 col-span-2">
        <SubmitButton submitting={disabled} />
      </div>
    </FieldSet>
  </Root>
}
