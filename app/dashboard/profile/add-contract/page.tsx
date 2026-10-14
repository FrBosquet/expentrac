'use client'
import { ErrorToaster } from '@components/error-toaster'
import { DaySelect } from '@components/form/DaySelect'
import { ProviderInput } from '@components/provider-input'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useWorkWrite } from '@hooks/resources'
import { EuroIcon, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type FormEvent } from 'react'

export default function Page() {
  const mutation = useWorkWrite()
  const router = useRouter()
  const registerWorkContract = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await mutation.mutateAsync(
        Object.fromEntries(new FormData(event.currentTarget))
      )
      router.push('/dashboard/profile')
    } catch {
      /* Retain draft; mutation exposes the error below. */
    }
  }
  return (
    <form className="contents" onSubmit={registerWorkContract}>
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
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
            step="0.01" type="number"
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
      <Button
        className="mt-6 max-xl:col-span-2 xl:col-start-4"
        disabled={mutation.isPending}
        type="submit"
      >
        <Save className="mr-2" size={16} />
        <span>Sign</span>
      </Button>
    </form>
  )
}
