/* eslint-disable prettier/prettier */
'use client'

import { cn } from '@lib/utils'
import {
  CircleDollarSign,
  Cog,
  Landmark,
  LayoutDashboard,
  Menu,
  PencilLine,
  Tv,
  User,
  User2
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { Footer } from './footer'
import { Header } from './header'
import { Logo } from './Logo'
import { NotificationBell } from './notifications/bell'
import { useUser } from './Provider'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { UserMenu } from './user/menu'

const SEPARATOR = 'separator'
const PUSHER = 'pusher'

const components = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    Icon: LayoutDashboard
  },
  SEPARATOR,
  {
    title: 'Profile',
    href: '/dashboard/profile',
    Icon: User2
  },
  {
    title: 'Loans',
    href: '/dashboard/loans',
    Icon: CircleDollarSign
  },
  {
    title: 'Subscriptions',
    href: '/dashboard/subscriptions',
    Icon: Tv
  },
  SEPARATOR,
  {
    title: 'Providers',
    href: '/dashboard/providers',
    Icon: Landmark
  },
  SEPARATOR,
  PUSHER,
  {
    title: 'Blog',
    href: '/blog',
    Icon: PencilLine
  }
]
interface Props {
  children: ReactNode
}

const Sidebar = () => {
  const { user, loading } = useUser()
  const pathname = usePathname()

  return (
    <aside
      className="group fixed z-50 hidden h-screen w-20 flex-col items-center gap-10 overflow-hidden border-r
      bg-card
      py-10 shadow-xl transition-all hover:w-56 md:flex
      xl:w-56
    "
    >
      <Logo className="hidden self-start px-6 text-3xl -tracking-widest xl:block">
        expentrac
      </Logo>
      <article className="relative flex w-full flex-col items-center gap-1">
        <UserMenu className="xl:size-20" />
        <h2
          className="
        absolute top-10 h-0 whitespace-nowrap pt-4 text-sm font-light uppercase opacity-0 transition
        group-hover:opacity-100
        xl:relative xl:top-0 xl:text-base xl:opacity-100
        "
        >
          {loading ? '...' : user.name}
        </h2>
      </article>
      <menu className="flex w-full flex-1 flex-col">
        {components.map((component, index) => {
          if (typeof component === 'string') {
            const key = `component${index}`

            if (component === SEPARATOR) {
              return <Separator key={key} />
            } else {
              return <div key={key} className="flex-1" />
            }
          }

          const { title, href, Icon } = component
          const isSelected = href === pathname

          return (
            <Link
              key={title}
              aria-disabled={isSelected}
              className={twMerge(
                'relative px-6 h-12 transition font-semibold text-sm uppercase hover:text-expentrac-800 hover:bg-theme-back dark:hover:text-expentrac flex items-center gap-2',
                isSelected &&
                'bg-theme-back text-expentrac-800 dark:text-expentrac-300 pointer-events-none'
              )}
              href={href}
            >
              <Icon className="w-8 shrink-0 xl:w-4" />
              <p
                className="
              flex h-full origin-left items-center pr-4 opacity-0
              group-hover:opacity-100 xl:opacity-100
            "
              >
                {title}
              </p>
            </Link>
          )
        })}
      </menu>
    </aside>
  )
}

const MobileNavigation = () => {
  const [isClosed, setIsClosed] = useState(true)
  const pathname = usePathname()

  const close = () => {
    setIsClosed(true)
  }

  const toggle = () => {
    setIsClosed((v) => !v)
  }

  return (
    <div className="z-50 h-20 w-screen bg-theme-back md:hidden">
      <menu
        className="
      fixed bottom-0 grid h-20 w-screen grid-cols-5 place-content-center justify-items-center border-t bg-theme-bottom shadow-xl
    "
      >
        <Link
          className="data-[selected=true]:text-expentrac-800"
          data-selected={pathname === '/dashboard'}
          href="/dashboard"
          onClick={close}
        >
          <LayoutDashboard />
        </Link>
        <Link
          className="data-[selected=true]:text-expentrac-800"
          data-selected={pathname === '/dashboard/settings'}
          href="/dashboard/settings"
          onClick={close}
        >
          <Cog />
        </Link>
        <Link
          className="data-[selected=true]:text-expentrac-800"
          data-selected={pathname === '/dashboard/settings'}
          href="/dashboard/settings"
          onClick={close}
        >
          <User />
        </Link>
        <NotificationBell
          className={
            pathname === '/dashboard/notifications' ? 'text-expentrac-800' : ''
          }
          onClick={close}
        />
        <Button className="h-auto p-0" variant="link" onClick={toggle}>
          <Menu />
        </Button>
      </menu>
      <aside
        className="pointer-events-auto fixed bottom-20 left-0 top-0 flex w-screen flex-col justify-end bg-theme-bottom transition-all data-[closed=true]:left-[100vw]"
        data-closed={isClosed}
      >
        {components.map((component, index) => {
          if (typeof component === 'string') {
            const key = `component${index}`

            if (component === SEPARATOR) {
              return <Separator key={key} />
            } else {
              return null
            }
          }

          const { title, href, Icon } = component

          if (['dashboard'].includes(title.toLowerCase())) return null

          const isSelected = href === pathname

          return (
            <Link
              key={title}
              aria-disabled={isSelected}
              className={cn(
                'relative py-4 px-6 transition font-semibold text-sm uppercase flex items-center gap-6',
                isSelected &&
                'bg-theme-back text-expentrac-800 dark:text-expentrac-300 pointer-events-none'
              )}
              href={href}
              onClick={close}
            >
              <Icon className="shrink-0" />
              <p
                className="
            flex h-full items-center text-lg
          "
              >
                {title}
              </p>
            </Link>
          )
        })}
      </aside>
    </div>
  )
}

export function DashboardLayout({ children }: Props) {
  return (
    <div className="flex w-full flex-col md:flex-row">
      {/* SIDEBAR */}
      <Sidebar />

      {/* PAGE CONTENT */}
      <section
        className="flex min-h-screen flex-1 flex-col
      md:pl-20 xl:pl-56
    "
      >
        <div
          className="mx-auto grid w-full max-w-4xl flex-1 auto-rows-min grid-cols-2 gap-1
        p-6 xl:max-w-6xl xl:grid-cols-4
      "
        >
          <Header />
          {children}
        </div>
        <Footer />
      </section>

      {/* MOBILE NAVIGATION */}
      <MobileNavigation />
    </div>
  )
}
