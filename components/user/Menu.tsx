import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { User } from "@prisma/client"

type Props = {
  user: User
}

export const Menu = ({ user }: Props) => {
  console.log(user)

  const fallback = user.name?.split(' ').map((n) => n.charAt(0)).join('')

  return <Avatar>
    <AvatarImage src={user.image as string} alt={user.name as string} />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
}