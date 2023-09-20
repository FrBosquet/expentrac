'use client'

import { useNotifications } from '@components/notifications/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import { type User } from '@prisma/client'
import {
  Bell,
  BellRing,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Props {
  user: User
}

export const Menu = ({ user }: Props) => {
  const { hasPending } = useNotifications()
  const { push } = useRouter()

  const fallback = user.name?.split(' ').map((n) => n.charAt(0)).join('')

  const handleSignOut = () => {
    void signOut()
  }

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <article className='relative'>
        <Avatar className="cursor-pointer">
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
