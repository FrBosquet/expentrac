'use client'

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
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface Props {
  user: User
}

export const Menu = ({ user }: Props) => {
  const fallback = user.name?.split(' ').map((n) => n.charAt(0)).join('')

  const handleSignOut = () => {
    void signOut()
  }

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Avatar className="cursor-pointer">
        <AvatarImage src={user.image as string} alt={user.name as string} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
        {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}
