import { type User } from '@lib/prisma'
import { twMerge } from 'tailwind-merge'
import { AvatarFallback, AvatarImage, Avatar as UiAvatar } from './ui/avatar'

export const Avatar = ({ user, className }: { user: User, className: string }) => {
  return <UiAvatar className={twMerge('cursor-pointer border border-theme-border', className)}>
    <AvatarImage src={user.image as string} alt={user.name as string} />
    <AvatarFallback>{user.name?.slice(0, 2)} </AvatarFallback>
  </UiAvatar>
}
