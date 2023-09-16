import { Logo } from '@components/Logo'
import { NavigationLinks } from '@components/NavigationLinks'
import { HeaderSignin } from '@components/hero/signin'
import Link from 'next/link'

export const Header = () => {
  return <header className='flex w-full p-6 justify-between gap-4'>
    <Link href='/'>
      <Logo className="text-4xl">expentrac</Logo>
    </Link>
    <NavigationLinks className='flex-1' />
    <HeaderSignin />
  </header>
}
