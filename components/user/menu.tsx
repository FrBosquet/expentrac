'use client'

import { useNotifications } from '@components/notifications/context'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import { type User } from '@lib/prisma'
import {
  Bell,
  BellRing,
  LogOut
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export const UserMenu = () => {
  const { data: session } = useSession()
  const { hasPending } = useNotifications()
  const { push } = useRouter()

  if (!session) return null

  const { user } = session as { user: User }

  const fallback = user.name?.split(' ').map((n) => n.charAt(0)).join('')

  const handleSignOut = () => {
    void signOut()
  }

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <article className='relative'>
        <Avatar className="cursor-pointer border border-slate-900 dark:border-slate-200">
          <AvatarImage src={user.image as string} alt={user.name as string} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        {hasPending ? <div className='w-3 h-3 absolute left-0 bottom-0 bg-red-400 rounded-full' /> : null}
      </article>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer" onClick={async () => { push('/dashboard/notifications') }}>
        {hasPending
          ? <BellRing className="mr-2 h-4 w-4 text-red-500" />
          : <Bell className="mr-2 h-4 w-4" />
        }
        <span>Notifications</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}
