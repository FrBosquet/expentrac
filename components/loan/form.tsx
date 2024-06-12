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
import {
  type ChangeEvent,
  type FormEventHandler,
  useMemo,
  useState
} from 'react'

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
  const [formState, setFormState] = useState<Partial<LoanFormData>>(
    loan ? getFormData(loan) : { startDate: toHTMLInputFormat(new Date()) }
  )

  const [sharedWith, setSharedWith] = useState<RawUser[]>(
    loan?.shares.data.map(({ to }) => to) ?? []
  )
  const { providers } = useProviders()

  const brandOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.name
  }))

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target
    const value = target.value
    const name = target.name

    setFormState((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const calculatedFee = useMemo(() => {
    if (!formState.fee || !formState.endDate) return null

    const { startDate, endDate, fee, initial } = formState

    return getPaymentPlan(
      new Date(startDate!),
      new Date(endDate),
      Number(fee),
      Number(initial)
    )
  }, [formState])

  const removeShareHolder = (user: RawUser) => {
    setSharedWith((prev) => prev.filter((u) => u.id !== user.id))
  }

  return (
    <Root onSubmit={onSubmit}>
      <FieldSet disabled={disabled}>
        <LegacyFormField
          required
          defaultValue={loan?.name}
          label="Name"
          name="name"
        />
        <LegacyFormField
          required
          className="text-right"
          defaultValue={loan?.fee.monthly}
          label="Fee"
          name="fee"
          step="0.01"
          type="number"
          onChange={handleChange}
        >
          €
        </LegacyFormField>
        <LegacyFormField
          required
          className="text-right"
          defaultValue={loan?.fee.initial ?? 0}
          label="Initial"
          name="initial"
          step="0.01"
          type="number"
          onChange={handleChange}
        >
          €
        </LegacyFormField>

        <div className="col-span-2 grid grid-cols-3 gap-2">
          <span className="flex flex-col gap-2">
            <Label className="text-center text-xs" htmlFor="vendorId">
              Vendor
            </Label>
            <ProviderSelect
              required
              defaultValue={loan?.providers.vendor?.id}
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
              defaultValue={loan?.providers.platform?.id}
              items={brandOptions}
              name="platformId"
            />
          </span>

          <span className="flex flex-col gap-2">
            <Label className="text-center text-xs" htmlFor="lenderId">
              Lender
            </Label>
            <ProviderSelect
              required
              defaultValue={loan?.providers.lender?.id}
              items={brandOptions}
              name="lenderId"
            />
          </span>
        </div>

        <Separator className="col-span-2" />
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-2">
            <Label className="text-xs" htmlFor="startDate">
              Start date
            </Label>
            <Input
              required
              defaultValue={formState.startDate}
              id="startDate"
              name="startDate"
              type="date"
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Label className="text-xs" htmlFor="endDate">
              End date
            </Label>
            <Input
              required
              defaultValue={loan ? toHTMLInputFormat(loan.endDate) : undefined}
              id="endDate"
              name="endDate"
              type="date"
              onChange={handleChange}
            />
          </div>
        </div>

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

        <LegacyFormField
          defaultValue={loan?.resources.link ?? ''}
          label="Link"
          name="link"
        />
        <p className="col-span-2 text-xs">Direct link to this loan page</p>

        {calculatedFee && (
          <>
            <Separator className="col-span-2" />

            <div className="col-span-2 text-xs text-slate-600">
              you are going to pay{' '}
              {euroFormatter.format(calculatedFee.totalAmount)} in{' '}
              {calculatedFee.payments} months. You are going to be charged every
              day {new Date(calculatedFee.startDate).getDate()} of the month
            </div>
          </>
        )}

        <div className="col-span-2 flex justify-end gap-2">
          <SubmitButton submitting={disabled} />
        </div>
      </FieldSet>
    </Root>
  )
}
