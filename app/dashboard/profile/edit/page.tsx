import { Input } from '@components/ui/input'
import { authOptions } from '@lib/auth'
import { hasUser } from '@lib/session'
import { Save } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const data = await getServerSession(authOptions)

  if (!hasUser(data)) {
    redirect('/')
  }

  const { user } = data

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const name = formData.get('name')
    const role = formData.get('role')

    console.log({ name, role })
  }

  return (
    <>
      <form action={handleSubmit} className='flex gap-8 col-span-4'>
        <div className='flex flex-col justify-center flex-1 gap-2'>
          <label htmlFor='name' className='text-theme-light uppercase text-xs'>Name</label>
          <Input id='name' name='name' type='text' defaultValue={user?.name} className='p-2 text-lg' />

          <label htmlFor='role' className='text-theme-light uppercase text-xs'>Role</label>
          <Input id='role' name='role' type='text' defaultValue={user?.role} />

          <label htmlFor='email' className='text-theme-light uppercase text-xs'>Email</label>
          <Input disabled id='email' name='email' type='text' defaultValue={user?.email} />

        </div>
        <button type='submit'>
          <Save />
        </button>
      </form>
    </>
  )
}
