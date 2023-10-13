import { Logo } from './Logo'
import { DarkModeTogle } from './darkmode'
import { DateSelector } from './date/selector'
import { NotificationBell } from './notifications/bell'

export const Header = () => {
  return <header className="flex gap-4 p-4 justify-between items-center border-b border-theme-border mb-8 lg:px-0">
    <Logo className="text-4xl -tracking-widest px-2 flex-1 hidden md:block">et</Logo>
    <DateSelector />
    <NotificationBell className='hidden md:block' />
    <DarkModeTogle />
  </header>
}
