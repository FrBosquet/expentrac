'use client'

import { useNotifications } from '@components/notifications/context'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import { useUser } from '@components/user/hooks'
import { Bell, BellRing, LogOut, User2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { twMerge } from 'tailwind-merge'

export const UserMenu = ({ className }: { className?: string }) => {
  const { user, name } = useUser()
  const { hasPending } = useNotifications()
  const { push } = useRouter()

  const fallback = name
    ?.split(' ')
    .map((n) => n.charAt(0))
    .join('')

  const handleSignOut = () => {
    void signOut()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <article className="relative">
          <Avatar
            className={twMerge(
              'cursor-pointer border border-theme-border w-12 h-12',
              className
            )}
          >
            <AvatarImage alt={user?.name!} src={user?.image!} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </article>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            push('/dashboard/profile')
          }}
        >
          <User2 className="mr-2" size={16} />
          <span>You</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            push('/dashboard/notifications')
          }}
        >
          {hasPending ? (
            <BellRing className="mr-2 size-4 text-red-500" />
          ) : (
            <Bell className="mr-2 size-4" />
          )}
          <span>Notifications</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
          <LogOut className="mr-2 size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
