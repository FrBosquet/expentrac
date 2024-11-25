import { ErrorToaster } from '@components/error-toaster'
import { DaySelect } from '@components/form/DaySelect'
import { ProviderInput } from '@components/provider-input'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { CONTRACT_TYPE } from '@lib/contract'
import { prisma } from '@lib/prisma'
import { PROVIDER_TYPE } from '@lib/provider'
import { EuroIcon, Save } from 'lucide-react'
import { redirect } from 'next/navigation'

import { getUserData } from '../getUser'

export default async function Page() {
  const registerWorkContract = async (formData: FormData) => {
    'use server'
    try {
      const user = await getUserData()
      const name = formData.get('name') as string
      const employer = formData.get('employer') as string
      const salary = Number(formData.get('salary'))
      const start = new Date(formData.get('start') as string)
      const payday = Number(formData.get('payday'))

      await prisma.contract.create({
        data: {
          user: {
            connect: {
              id: user.id
            }
          },
          name,
          type: CONTRACT_TYPE.WORK,
          periods: {
            create: {
              from: start.toISOString(),
              payday,
              fee: salary
            }
          },
          providers: {
            create: {
              providerId: employer,
              as: PROVIDER_TYPE.EMPLOYER
            }
          }
        }
      })
    } catch (e: unknown) {
      const message = (e as Error).message

      redirect(
        `/dashboard/profile/add-contract?error=${message}&timeframe=${Date.now()}`
      )
    }

    redirect('/dashboard/profile')
  }

  return (
    <form action={registerWorkContract} className="contents">
      <ErrorToaster
        errors={{
          'invalid-data': 'Invalid data provided. Please try again.'
        }}
      />

      <fieldset className="col-span-2 xl:col-span-4">
        <h1 className="text-xl uppercase">Register a work contract</h1>
        <label className="text-xs uppercase text-theme-light" htmlFor="name">
          Role
        </label>
        <Input className="p-2 text-lg" id="name" name="name" type="text" />

        <label
          className="text-xs uppercase text-theme-light"
          htmlFor="employer"
        >
          Employer
        </label>
        <ProviderInput name="employer" />

        <label className="text-xs uppercase text-theme-light" htmlFor="salary">
          Net monthly salary
        </label>
        <div className="group relative">
          <Input
            className="p-2 pr-4 text-right text-lg"
            id="salary"
            min={0}
            name="salary"
            type="number"
          />
          <EuroIcon
            className="absolute right-2 top-1/2 -translate-y-1/2 group-focus-within:hidden group-hover:hidden"
            size={16}
          />
        </div>

        <label className="text-xs uppercase text-theme-light" htmlFor="start">
          Start date
        </label>
        <Input
          className="w-full p-2 text-right text-lg"
          id="start"
          name="start"
          type="date"
        />

        <label className="text-xs uppercase text-theme-light" htmlFor="payday">
          Payday (typical)
        </label>
        <DaySelect required defaultValue={28} name="payday" />
      </fieldset>
      <Button className="mt-6 max-xl:col-span-2 xl:col-start-4" type="submit">
        <Save className="mr-2" size={16} />
        <span>Sign</span>
      </Button>
    </form>
  )
}
