import { Button } from './ui/button'

type Props = {
  href: string
  children: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

export const ButtonLink = ({ href, children, ...props }: Props) => {
  return <Button asChild variant='outline' className='p-2 h-auto text-xs flex items-center gap-2'>
    <a href={href} {...props}>
      {children}
    </a>
  </Button>
}
