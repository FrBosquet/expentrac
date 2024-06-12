'use client'

import { DaySelect } from '@components/form/DaySelect'
import { MonthSelect } from '@components/form/MonthSelect'
import { useProviders } from '@components/provider/context'
import { ProviderSelect } from '@components/ProviderSelect'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Separator } from '@components/ui/separator'
import { Switch } from '@components/ui/switch'
import { UserSearch } from '@components/UserSearch'
import { type User } from '@lib/prisma'
import { type Subscription } from '@lib/sub'
import { Trash } from 'lucide-react'
import { type FormEventHandler, useState } from 'react'

import { FieldSet, LegacyFormField, Root, SubmitButton } from '../Form'

interface Props {
  sub?: Subscription
  onSubmit: FormEventHandler<HTMLFormElement>
  disabled?: boolean
}

export const SubscriptionFormPeriodicity = ({
  sub
}: {
  sub?: Subscription
}) => {
  const [isYearly, setIsYearly] = useState(sub?.time.isYearly)

  const handleChangeYearly = (newValue: boolean) => {
    setIsYearly(newValue)
  }

  const defaultPayday = sub?.time.payday ?? new Date().getDate()

  return (
    <>
      <section className="col-span-2 flex items-center justify-end gap-2">
        <Switch
          defaultChecked={sub?.time.isYearly}
          id="yearly"
          name="yearly"
          onCheckedChange={handleChangeYearly}
        />
        <Label className="font-semibold" htmlFor="yearly">
          Paid yearly?
        </Label>
      </section>

      {isYearly ? (
        <section className="col-span-2 flex gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <Label className="text-center" htmlFor="paymonth">
              Pay month
            </Label>
            <MonthSelect
              required
              className="w-auto min-w-32"
              defaultValue={sub?.time.paymonth}
              name="paymonth"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label className="text-center" htmlFor="paymonth">
              Payday
            </Label>
            <DaySelect
              required
              className="w-auto min-w-32"
              defaultValue={defaultPayday}
              name="payday"
            />
          </div>
        </section>
      ) : (
        <section className="col-span-2 flex items-center justify-end gap-2">
          <Label className="text-center" htmlFor="payday">
            Payday
          </Label>
          <DaySelect
            required
            className="w-auto min-w-32"
            defaultValue={defaultPayday}
            name="payday"
          />
        </section>
      )}
    </>
  )
}

export const SubscriptionForm = ({
  sub,
  onSubmit,
  disabled = false
}: Props) => {
  const { providers } = useProviders()

  const [sharedWith, setSharedWith] = useState<User[]>(
    sub?.shares.data.map(({ to }) => to) ?? []
  )

  const removeShareHolder = (user: User) => {
    setSharedWith((prev) => prev.filter((u) => u.id !== user.id))
  }

  const brandOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.name
  }))

  const defaultFee = sub
    ? sub.time.isYearly
      ? sub.fee.yearly.toFixed(2)
      : sub.fee.monthly.toFixed(2)
    : ''

  return (
    <Root onSubmit={onSubmit}>
      <FieldSet disabled={disabled}>
        <LegacyFormField
          required
          defaultValue={sub?.name}
          label="Name"
          name="name"
        />
        <LegacyFormField
          required
          className="text-right"
          defaultValue={defaultFee}
          label="Fee"
          name="fee"
          step="0.01"
          type="number"
        >
          €
        </LegacyFormField>

        <section className="col-span-2 grid grid-cols-2 gap-2">
          <span className="flex flex-col gap-2">
            <Label className="text-center text-xs" htmlFor="vendorId">
              Vendor
            </Label>
            <ProviderSelect
              required
              defaultValue={sub?.providers.vendor?.id}
              items={brandOptions}
              name="vendorId"
            />
          </span>

          <span className="flex flex-col gap-2">
            <Label className="text-center text-xs" htmlFor="platformId">
              Platform
            </Label>
            <ProviderSelect
              required
              defaultValue={sub?.providers.platform?.id}
              items={brandOptions}
              name="platformId"
            />
          </span>
        </section>

        <SubscriptionFormPeriodicity sub={sub} />

        <Separator className="col-span-2" />
        <LegacyFormField
          defaultValue={sub?.resources.link ?? ''}
          label="Link"
          name="link"
        />
        <p className="col-span-2 text-xs">
          Direct link to this subscription page
        </p>

        <Separator className="col-span-2" />
        <div className="col-span-2 flex flex-col gap-4">
          <section className="flex items-center justify-between">
            <Label>Share this payment </Label>
            <UserSearch
              selectedUsers={sharedWith}
              onSelect={(user) => {
                setSharedWith((prev) => [...prev, user])
              }}
            />
          </section>
          <section className="flex flex-col gap-2">
            {sharedWith.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-1 text-sm"
              >
                <span className="font-semibold">{user.name}</span>
                <span className="flex-1 text-left text-slate-600">
                  {user.email}
                </span>
                <Button
                  className="h-auto p-2"
                  variant="destructive"
                  onClick={() => {
                    removeShareHolder(user)
                  }}
                >
                  <Trash size={10} />
                </Button>
                <input
                  name={`sharedWith:${user.id}`}
                  type="hidden"
                  value={user.id}
                />
              </div>
            ))}
          </section>
          {sharedWith.length > 0 ? (
            <section className="text-xs text-slate-600">
              Your mate will recibe a notification and has to accept it for this
              to be considered a shared loan
            </section>
          ) : null}
        </div>

        <Separator className="col-span-2" />
        <div className="col-span-2 flex justify-end gap-2 pt-4">
          <SubmitButton submitting={disabled} />
        </div>
      </FieldSet>
    </Root>
  )
}
