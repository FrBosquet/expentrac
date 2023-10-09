import { Logo } from './Logo'
import { DarkModeTogle } from './darkmode'

export const Header = () => {
  return <header className="flex gap-4 p-4 justify-between items-center border-b border-theme-border">
    <Logo className="text-4xl -tracking-widest px-2 flex-1">et</Logo>
    <DarkModeTogle />
  </header>
}
