import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface Props {
  className?: string
}

export const NavMenu = ({ className }: Props) => {
  return <menu className={twMerge('gap-4 hidden sm:flex', className)}>
    <Link href='/blog' className='uppercase text-slate-400 hover:text-slate-200 transition'>Blog</Link>
    <Link href='/pricing' className='uppercase text-slate-400 hover:text-slate-200 transition'>Pricing</Link>
    <Link href='/team' className='uppercase text-slate-400 hover:text-slate-200 transition'>Team</Link>
  </menu>
}
