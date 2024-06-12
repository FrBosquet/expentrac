import { twMerge } from 'tailwind-merge'

import { DarkModeTogle } from './dark-mode'
import { DateSelector } from './date/selector'
import { Logo } from './Logo'
import { NotificationBell } from './notifications/bell'

interface Props {
  className?: string
}

export const Header = ({ className }: Props) => {
  return (
    <header
      className={twMerge(
        'flex gap-4 p-4 justify-between items-center border-b border-theme-border mb-8 lg:px-0 col-span-2 xl:col-span-4',
        className
      )}
    >
      <Logo className="hidden flex-1 px-2 text-4xl -tracking-widest md:block">
        et
      </Logo>
      <DateSelector />
      <NotificationBell className="hidden md:block" />
      <DarkModeTogle />
    </header>
  )
}
