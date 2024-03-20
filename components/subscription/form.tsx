'use client'

import { ProviderSelect } from '@components/ProviderSelect'
import { UserSearch } from '@components/UserSearch'
import { DaySelect } from '@components/form/DaySelect'
import { MonthSelect } from '@components/form/MonthSelect'
import { useProviders } from '@components/provider/context'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Separator } from '@components/ui/separator'
import { Switch } from '@components/ui/switch'
import { type User } from '@lib/prisma'
import { type Subscription } from '@lib/sub'
import { Trash } from 'lucide-react'
import { useState, type FormEventHandler } from 'react'
import { FieldSet, LegacyFormField, Root, SubmitButton } from '../Form'

interface Props {
  sub?: Subscription
  onSubmit: FormEventHandler<HTMLFormElement>
  disabled?: boolean
}

export const SubscriptionFormPeriodicity = ({ sub }: { sub?: Subscription }) => {
  const [isYearly, setIsYearly] = useState(sub?.time.isYearly)

  const handleChangeYearly = (newValue: boolean) => {
    setIsYearly(newValue)
  }

  const defaultPayday = sub?.time.payday ?? new Date().getDate()

  return <>
    <section className="flex justify-end items-center col-span-2 gap-2">
      <Switch onCheckedChange={handleChangeYearly} id="yearly" name='yearly' defaultChecked={sub?.time.isYearly} />
      <Label htmlFor="yearly" className='font-semibold'>Paid yearly?</Label>
    </section>

    {isYearly
      ? <section className='col-span-2 flex gap-2'>
        < div className='flex flex-col flex-1 gap-2' >
          <Label htmlFor='paymonth' className="text-center">
            Pay month</Label>
          <MonthSelect className='w-auto min-w-[8rem]' name="paymonth" required defaultValue={sub?.time.paymonth} />
        </div >
        <div className='flex flex-col flex-1 gap-2'>
          <Label htmlFor='paymonth' className="text-center">
            Payday</Label>
          <DaySelect className='w-auto min-w-[8rem]' name="payday" required defaultValue={defaultPayday} />
        </div>
      </section >
      : <section className='col-span-2 flex gap-2 items-center justify-end'>
        <Label htmlFor='payday' className="text-center">
          Payday
        </Label>
        <DaySelect className='w-auto min-w-[8rem]' required name="payday" defaultValue={defaultPayday} />
      </section>}
  </>
}

export const SubscriptionForm = ({ sub, onSubmit, disabled = false }: Props) => {
  const { providers } = useProviders()

  const [sharedWith, setSharedWith] = useState<User[]>(sub?.shares.data.map(({ to }) => to) ?? [])

  const removeShareHolder = (user: User) => {
    setSharedWith(prev => prev.filter((u) => u.id !== user.id))
  }

  const brandOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.name
  }))

  const defaultFee = sub
    ? sub.time.isYearly ? sub.fee.yearly.toFixed(2) : sub.fee.monthly.toFixed(2)
    : ''

  return <Root onSubmit={onSubmit}>
    <FieldSet disabled={disabled}>
      <LegacyFormField required defaultValue={sub?.name} name="name" label="Name" />
      <LegacyFormField required defaultValue={defaultFee} name="fee" label="Fee" type="number" step="0.01" className='text-right'>€</LegacyFormField>

      <section className="col-span-2 grid grid-cols-2 gap-2">
        <span className="flex flex-col gap-2">
          <Label htmlFor='vendorId' className="text-xs text-center">
            Vendor
          </Label>
          <ProviderSelect required name="vendorId" items={brandOptions} defaultValue={sub?.providers.vendor?.id} />
        </span>

        <span className="flex flex-col gap-2">
          <Label htmlFor='platformId' className="text-xs text-center">
            Platform
          </Label>
          <ProviderSelect required name="platformId" items={brandOptions} defaultValue={sub?.providers.platform?.id} />
        </span>
      </section>

      <SubscriptionFormPeriodicity sub={sub} />

      <Separator className="col-span-2" />
      <LegacyFormField defaultValue={sub?.resources.link ?? ''} name="link" label="Link" />
      <p className='text-xs col-span-2'>Direct link to this subscription page</p>

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
      <div className="flex justify-end gap-2 pt-4 col-span-2">
        <SubmitButton submitting={disabled} />
      </div>
    </FieldSet>
  </Root>
}
