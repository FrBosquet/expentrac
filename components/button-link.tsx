import Link from 'next/link'

import { Button } from './ui/button'

type Props = {
  href: string
  children: React.ReactNode
  isExternal?: boolean
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

export const ButtonLink = ({
  href,
  children,
  isExternal = false,
  ...props
}: Props) => {
  return (
    <Button
      asChild
      className="flex h-auto items-center gap-2 p-2 text-xs"
      variant="outline"
    >
      <Link href={href} {...props}>
        {children}
      </Link>
    </Button>
  )
}
