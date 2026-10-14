import { type PublicUser } from '@lib/models'
import { twMerge } from 'tailwind-merge'

import { Avatar as UiAvatar, AvatarFallback, AvatarImage } from './ui/avatar'

export const Avatar = ({
  user,
  className
}: {
  user: PublicUser
  className: string
}) => {
  return (
    <UiAvatar
      className={twMerge(
        'cursor-pointer border border-theme-border',
        className
      )}
    >
      <AvatarImage alt={user.name!} src={user.image!} />
      <AvatarFallback>{user.name?.slice(0, 2)} </AvatarFallback>
    </UiAvatar>
  )
}
