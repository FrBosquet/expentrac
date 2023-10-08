'use client'

import { ProviderSelect } from '@components/ProviderSelect'
import { UserSearch } from '@components/UserSearch'
import { DaySelect } from '@components/form/DaySelect'
import { useProviders } from '@components/provider/context'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Separator } from '@components/ui/separator'
import { Switch } from '@components/ui/switch'
import { type User } from '@lib/prisma'
import { type SubscriptionComplete } from '@types'
import { Trash } from 'lucide-react'
import { useState, type FormEventHandler } from 'react'
import { FieldSet, FormField, Root, SubmitButton } from '../Form'

interface Props {
  sub?: SubscriptionComplete
  onSubmit: FormEventHandler<HTMLFormElement>
  disabled?: boolean
}

export const SubscriptionForm = ({ sub, onSubmit, disabled = false }: Props) => {
  const { providers } = useProviders()

  const [sharedWith, setSharedWith] = useState<User[]>(sub?.shares?.map(({ user }) => user) ?? [])

  const removeShareHolder = (user: User) => {
    setSharedWith(prev => prev.filter((u) => u.id !== user.id))
  }

  const brandOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.provider.name
  }))

  return <Root onSubmit={onSubmit}>
    <FieldSet disabled={disabled}>
      <FormField required defaultValue={sub?.name} name="name" label="Name" />
      <FormField required defaultValue={sub?.fee} name="fee" label="Fee" type="number" step="0.01" className='text-right'>€</FormField>

      <section className="flex justify-end items-center col-span-2 gap-2">
        <Switch id="yearly" name='yearly' defaultChecked={sub?.yearly} />
        <Label htmlFor="yearly" className='font-semibold'>Paid yearly?</Label>
      </section>

      <section className="col-span-2 grid grid-cols-2 gap-2">
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
      </section>

      <section className='col-span-2 flex gap-2 items-center justify-end'>
        <Label htmlFor='payday' className="text-center font-semibold text-sm selft-end">
          Payday (optional)
        </Label>
        <DaySelect className='w-auto min-w-[8rem]' name="payday" defaultValue={sub?.payday} />
      </section>

      <Separator className="col-span-2" />
      <FormField defaultValue={sub?.link ?? ''} name="link" label="Link" />
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
