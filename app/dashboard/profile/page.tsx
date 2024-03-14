import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { getUserInitials } from '@lib/session'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { getUserData } from './getUser'

export default async function Page() {
  const user = await getUserData()
  const fallback = getUserInitials(user)

  return (
    <>
      <header className='flex gap-8 col-span-4'>
        <Avatar className={'border border-theme-border w-48 h-48'}>
          <AvatarImage src={user?.image!} alt={user?.name!} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col justify-center flex-1'>
          <h1 className='text-5xl font-extralight uppercase'>{user?.name!}</h1>
          {user?.occupation && <p className='text-sm font-bold text-theme-accent uppercase'>{user?.occupation}</p>}
          <p className='text-xl text-theme-light'>{user?.email!}</p>
        </div>
        <Link href='profile/edit'>
          <Pencil />
        </Link>
      </header>
    </>
  )
}
