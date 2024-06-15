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
      <header className="col-span-4 flex gap-8">
        <Avatar className={'size-48 border border-theme-border'}>
          <AvatarImage alt={user?.name!} src={user?.image!} />
          <AvatarFallback className="text-7xl">{fallback}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col justify-center gap-2">
          <h1 className="text-5xl font-extralight uppercase">{user?.name!}</h1>
          {user?.occupation && (
            <p className="text-xs font-bold uppercase text-theme-accent">
              {user?.occupation}
            </p>
          )}
          <p className="text-xl text-theme-light">{user?.email!}</p>
        </div>
        <Link href="profile/edit">
          <Pencil />
        </Link>
      </header>
    </>
  )
}
