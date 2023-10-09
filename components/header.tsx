import { Logo } from './Logo'
import { DarkModeTogle } from './darkmode'
import { UserMenu } from './user/menu'

export const Header = () => {
  return <header className="flex gap-4 p-2 justify-between items-center border-b border-theme-border">
    <Logo className="text-4xl -tracking-widest px-2 flex-1">et</Logo>
    <DarkModeTogle />
    <UserMenu />
  </header>
}
