import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { getUserInitials } from '@lib/session'
import { User } from '@prisma/client'
import { Pencil } from 'lucide-react'
import Link from 'next/link'

type Props = {
  user: User
}

export const ProfileHeader = ({ user }: Props) => {
  const fallback = getUserInitials(user)

  return (
    <header className="col-span-4 mb-4 flex gap-8">
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
  )
}

ProfileHeader.skeleton = () => {
  return (
    <div className="col-span-4 flex animate-pulse gap-8">
      <div className="size-48 rounded-full border border-theme-border bg-slate-400"></div>
      <div className="flex flex-1 flex-col items-start justify-center gap-2">
        <h1 className="inline-block bg-slate-400 text-5xl font-extralight uppercase text-transparent">
          loading username
        </h1>
        <p className="inline-block bg-theme-accent text-xs font-bold uppercase text-transparent">
          loading user ocupation
        </p>
        <p className="inline-block bg-theme-light text-xl text-transparent">
          loading user email
        </p>
      </div>
    </div>
  )
}
