import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface Props {
  className?: string
}

export const NavigationLinks = ({ className }: Props) => {
  return <menu className={twMerge('gap-4 hidden sm:flex', className)}>
    <Link href='/blog' className='uppercase text-theme-light hover:text-theme-front transition'>Blog</Link>
    <Link href='/pricing' className='uppercase text-theme-light hover:text-theme-front transition'>Pricing</Link>
    <Link href='/team' className='uppercase text-theme-light hover:text-theme-front transition'>Team</Link>
  </menu>
}
