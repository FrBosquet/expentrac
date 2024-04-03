'use client'

import { useProviders } from '@components/provider/context'
import { ProviderSelect } from '@components/ProviderSelect'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Separator } from '@components/ui/separator'
import { UserSearch } from '@components/UserSearch'
import { euroFormatter } from '@lib/currency'
import { toHTMLInputFormat } from '@lib/dates'
import { getPaymentPlan, type Loan, type LoanFormData } from '@lib/loan'
import { type RawUser } from '@lib/prisma'
import { Trash } from 'lucide-react'
import { useMemo, useState, type ChangeEvent, type FormEventHandler } from 'react'
import { FieldSet, LegacyFormField, Root, SubmitButton } from '../Form'

interface Props {
  loan?: Loan
  onSubmit: FormEventHandler<HTMLFormElement>
  disabled?: boolean
}

const getFormData = (loan: Loan): LoanFormData => ({
  name: loan.name,
  fee: loan.fee.monthly.toString(),
  initial: loan.fee.initial.toString(),
  vendorId: loan.providers.vendor?.id,
  platformId: loan.providers.platform?.id,
  lenderId: loan.providers.lender?.id,
  startDate: toHTMLInputFormat(loan.startDate),
  endDate: toHTMLInputFormat(loan.endDate),
  link: loan.resources.link ?? ''
})

export const LoanForm = ({ loan, onSubmit, disabled = false }: Props) => {
  const [formState, setFormState] = useState<Partial<LoanFormData>>(loan
    ? getFormData(loan)
    : { startDate: toHTMLInputFormat(new Date()) }
  )

  const [sharedWith, setSharedWith] = useState<RawUser[]>(loan?.shares.data.map(({ to }) => to) ?? [])
  const { providers } = useProviders()

  const brandOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.name
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

    return getPaymentPlan(new Date(startDate!), new Date(endDate), Number(fee), Number(initial))
  }, [formState])

  const removeShareHolder = (user: RawUser) => {
    setSharedWith(prev => prev.filter((u) => u.id !== user.id))
  }

  return <Root onSubmit={onSubmit}>
    <FieldSet disabled={disabled}>
      <LegacyFormField required defaultValue={loan?.name} name="name" label="Name" />
      <LegacyFormField required defaultValue={loan?.fee.monthly} name="fee" label="Fee" type="number" step="0.01" className='text-right' onChange={handleChange}>€</LegacyFormField>
      <LegacyFormField required defaultValue={loan?.fee.initial ?? 0} name="initial" label="Initial" type="number" step="0.01" className='text-right' onChange={handleChange}>€</LegacyFormField>

      <div className="col-span-2 grid grid-cols-3 gap-2">
        <span className="flex flex-col gap-2">
          <Label htmlFor='vendorId' className="text-xs text-center">
            Vendor
          </Label>
          <ProviderSelect required name="vendorId" items={brandOptions} defaultValue={loan?.providers.vendor?.id} />
        </span>

        <span className="flex flex-col gap-2">
          <Label htmlFor='platformId' className="text-xs text-center">
            Platform
          </Label>
          <ProviderSelect required name="platformId" items={brandOptions} defaultValue={loan?.providers.platform?.id} />
        </span>

        <span className="flex flex-col gap-2">
          <Label htmlFor='lenderId' className="text-xs text-center">
            Lender
          </Label>
          <ProviderSelect required name="lenderId" items={brandOptions} defaultValue={loan?.providers.lender?.id} />
        </span>

      </div>

      <Separator className="col-span-2" />
      <div className="col-span-2 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 items-center">
          <Label htmlFor='startDate' className="text-xs">
            Start date
          </Label>
          <Input id="startDate" name="startDate" required defaultValue={formState.startDate} onChange={handleChange} type="date" />
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Label htmlFor='endDate' className="text-xs">
            End date
          </Label>
          <Input id="endDate" name="endDate" required defaultValue={loan ? toHTMLInputFormat(loan.endDate) : undefined} onChange={handleChange} type="date" />
        </div>
      </div>

      <Separator className="col-span-2" />
      <div className='col-span-2 flex flex-col gap-4'>
        <section className='flex justify-between items-center'>
          <Label>Share this payment </Label>
          <UserSearch onSelect={(user) => {
            setSharedWith(prev => [...prev, user])
          }} selectedUsers={sharedWith} />
        </section>
        <section className='flex flex-col gap-2'>
          {sharedWith.map((user) => (
            <div key={user.id} className='flex justify-between items-center text-sm gap-1'>
              <span className='font-semibold'>{user.name}</span>
              <span className='flex-1 text-left text-slate-600'>{user.email}</span>
              <Button onClick={() => { removeShareHolder(user) }} variant='destructive' className='p-2 h-auto' ><Trash size={10} /></Button>
              <input type='hidden' name={`sharedWith:${user.id}`} value={user.id} />
            </div>
          ))}
        </section>
        {sharedWith.length > 0
          ? <section className='text-xs text-slate-600'>
            Your mate will recibe a notification and has to accept it for this to be considered a shared loan
          </section>
          : null}
      </div>

      <Separator className="col-span-2" />

      <LegacyFormField defaultValue={loan?.resources.link ?? ''} name="link" label="Link" />
      <p className='text-xs col-span-2'>Direct link to this loan page</p>

      {calculatedFee && <>
        <Separator className="col-span-2" />

        <div className='col-span-2 text-xs text-slate-600'>
          you are going to pay {euroFormatter.format(calculatedFee.totalAmount)} in {calculatedFee.payments} months. You are going to be charged every day {new Date(calculatedFee.startDate).getDate()} of the month
        </div>
      </>}

      <div className="flex justify-end gap-2 col-span-2">
        <SubmitButton submitting={disabled} />
      </div>
    </FieldSet>
  </Root>
}
