import { Input } from '@components/ui/input'
import { prisma } from '@lib/prisma'
import { requireUser } from '@lib/server/api'
import { text } from '@lib/server/validation'
import { redirect } from 'next/navigation'

import { getUserData } from '../getUser'
import { SubmitButton } from './submitButton'

export default async function Page() {
  const user = await getUserData()

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const userId = await requireUser()
    const name = text(formData.get('name'), 'name')
    const occupation = formData.get('occupation')
      ? text(formData.get('occupation'), 'occupation')
      : ''

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        name,
        occupation
      }
    })

    redirect('/dashboard/profile')
  }

  return (
    <>
      <form action={handleSubmit} className="col-span-4 flex gap-8">
        <fieldset className="flex flex-1 flex-col justify-center gap-2">
          <label className="text-xs uppercase text-theme-light" htmlFor="name">
            Name
          </label>
          <Input
            className="p-2 text-lg"
            defaultValue={user?.name ?? ''}
            id="name"
            name="name"
            type="text"
          />

          <label
            className="text-xs uppercase text-theme-light"
            htmlFor="occupation"
          >
            Occupation
          </label>
          <Input
            defaultValue={user?.occupation ?? ''}
            id="occupation"
            name="occupation"
            type="text"
          />

          <label className="text-xs uppercase text-theme-light" htmlFor="email">
            Email
          </label>
          <Input
            disabled
            defaultValue={user?.email ?? ''}
            id="email"
            name="email"
            type="text"
          />
        </fieldset>
        <SubmitButton />
      </form>
    </>
  )
}
