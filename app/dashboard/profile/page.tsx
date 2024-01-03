import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { authOptions } from '@lib/auth'
import { getUserInitials, hasUser } from '@lib/session'
import { Pencil } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Page() {
  const data = await getServerSession(authOptions)

  if (!hasUser(data)) {
    redirect('/')
  }

  const { user } = data
  const fallback = getUserInitials(user)

  return (
    <>
      <header className='flex gap-8 col-span-4'>
        <Avatar className={'border border-theme-border w-48 h-48'}>
          <AvatarImage src={user?.image as string} alt={user?.name as string} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col justify-center flex-1'>
          <h1 className='text-5xl font-extralight uppercase'>{user?.name as string}</h1>
          <p className='text-xl text-theme-light'>{user?.email as string}</p>
        </div>
        <Link href='profile/edit'>
          <Pencil />
        </Link>
      </header>
    </>
  )
}
