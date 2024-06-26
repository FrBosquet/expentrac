import { SignInHeader } from '@components/hero/signin'
import { Logo } from '@components/Logo'
import { NavigationLinks } from '@components/NavigationLinks'
import Link from 'next/link'

import { HambugerMenu } from './HamburgerMenu'

export const Header = () => {
  return (
    <header className="flex w-full justify-between gap-4 p-6">
      <Link href="/">
        <Logo className="text-4xl">expentrac</Logo>
      </Link>
      <NavigationLinks className="flex-1" />
      <SignInHeader />
      <HambugerMenu />
    </header>
  )
}
