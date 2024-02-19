import { Input } from '@components/ui/input'
import { prisma } from '@lib/prisma'
import { redirect } from 'next/navigation'
import { getUserData } from '../getUser'
import { SubmitButton } from './submitButton'

export default async function Page() {
  const user = await getUserData()

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const name = formData.get('name') as string
    const occupation = formData.get('occupation') as string

    await prisma.user.update({
      where: {
        id: user.id
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
      <form action={handleSubmit} className='flex gap-8 col-span-4'>
        <fieldset className='flex flex-col justify-center flex-1 gap-2'>
          <label htmlFor='name' className='text-theme-light uppercase text-xs'>Name</label>
          <Input id='name' name='name' type='text' defaultValue={user?.name ?? ''} className='p-2 text-lg' />

          <label htmlFor='occupation' className='text-theme-light uppercase text-xs'>Occupation</label>
          <Input id='occupation' name='occupation' type='text' defaultValue={user?.occupation ?? ''} />

          <label htmlFor='email' className='text-theme-light uppercase text-xs'>Email</label>
          <Input disabled id='email' name='email' type='text' defaultValue={user?.email ?? ''} />

        </fieldset>
        <SubmitButton />
      </form>
    </>
  )
}
