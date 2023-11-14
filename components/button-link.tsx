import Link from 'next/link'
import { Button } from './ui/button'

type Props = {
  href: string
  children: React.ReactNode
  isExternal?: boolean
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

export const ButtonLink = ({ href, children, isExternal = false, ...props }: Props) => {
  return <Button asChild variant='outline' className='p-2 h-auto text-xs flex items-center gap-2'>
    <Link href={href} {...props}>
      {children}
    </Link>
  </Button>
}
