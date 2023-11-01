'use client'

import { CircleDollarSign, Cog, Landmark, LayoutDashboard, Menu, PencilLine, Tv, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Logo } from './Logo'
import { useUser } from './Provider'
import { Footer } from './footer'
import { Header } from './header'
import { NotificationBell } from './notifications/bell'
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

  return <aside className='group bg-card py-10 flex-col items-center gap-10 fixed h-screen border-r shadow-xl z-50
      hidden
      md:flex w-20 hover:w-56 transition-all overflow-hidden
      xl:w-56
    '>
    <Logo className='text-3xl -tracking-widest px-6 self-start hidden xl:block'>expentrac</Logo>
    <article className='flex flex-col gap-1 items-center w-full relative'>
      <UserMenu className='xl:w-20 xl:h-20' />
      <h2 className='
        text-sm pt-4 whitespace-nowrap opacity-0 transition h-0 absolute top-[2.5rem] uppercase font-light
        group-hover:opacity-100
        xl:text-md xl:relative xl:opacity-100 xl:top-0
        '>{loading ? '...' : user.name}</h2>
    </article>
    <menu className='flex-1 flex flex-col w-full'>
      {
        components.map((component, index) => {
          if (typeof component === 'string') {
            const key = `component${index}`

            if (component === SEPARATOR) {
              return <Separator key={key} />
            } else {
              return <div key={key} className='flex-1' />
            }
          }

          const { title, href, Icon } = component
          const isSelected = href === pathname

          return <Link aria-disabled={isSelected} key={title} href={href} className={twMerge('relative px-6 h-12 transition font-semibold text-sm uppercase hover:text-expentrac-800 hover:bg-theme-back dark:hover:text-expentrac flex items-center gap-2', isSelected && 'bg-theme-back text-expentrac-800 dark:text-expentrac-300 pointer-events-none')}>
            <Icon className='shrink-0 w-8 xl:w-4' />
            <p className='
              h-full flex items-center origin-left pr-4 opacity-0
              group-hover:opacity-100 xl:opacity-100
            '>{title}</p>
          </Link>
        })
      }

    </menu>
  </aside>
}

const MobileNavigation = () => {
  const [isClosed, setIsClosed] = useState(true)
  const pathname = usePathname()

  const close = () => {
    setIsClosed(true)
  }

  const toggle = () => {
    setIsClosed(v => !v)
  }

  return <div className='md:hidden w-screen bg-theme-back h-20 z-50'>
    <menu className='
      fixed bottom-0 h-20 w-screen bg-theme-bottom grid grid-cols-5 justify-items-center place-content-center shadow-xl border-t
    '>
      <Link data-selected={pathname === '/dashboard'} href='/dashboard' className='data-[selected=true]:text-expentrac-800' onClick={close}><LayoutDashboard /></Link>
      <Link data-selected={pathname === '/dashboard/settings'} href='/dashboard/settings' className='data-[selected=true]:text-expentrac-800' onClick={close}><Cog /></Link>
      <Link data-selected={pathname === '/dashboard/settings'} href='/dashboard/settings' className='data-[selected=true]:text-expentrac-800' onClick={close}><User /></Link>
      <NotificationBell className={pathname === '/dashboard/notifications' ? 'text-expentrac-800' : ''} onClick={close} />
      <Button variant='link' className='p-0 h-auto' onClick={toggle}><Menu /></Button>
    </menu>
    <aside data-closed={isClosed} className='fixed w-screen top-0 bottom-20 bg-theme-bottom left-0 data-[closed=true]:left-[100vw] transition-all flex flex-col justify-end pointer-events-[all]'>
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

        return <Link aria-disabled={isSelected} onClick={close} key={title} href={href} className={twMerge('relative py-4 px-6 transition font-semibold text-sm uppercase flex items-center gap-6', isSelected && 'bg-theme-back text-expentrac-800 dark:text-expentrac-300 pointer-events-none')}>
          <Icon className='shrink-0' />
          <p className='
            h-full flex items-center text-lg
          '>{title}</p>
        </Link>
      })}
    </aside>
  </div>
}

export function DashboardLayout({ children }: Props) {
  return <div className='flex w-full flex-col md:flex-row'>
    {/* SIDEBAR */}
    <Sidebar />

    {/* PAGE CONTENT */}
    <section className='flex-1 min-h-screen flex flex-col
      md:pl-20 xl:pl-56
    '>
      <div className="flex-1 w-full max-w-4xl xl:max-w-6xl p-6 mx-auto grid grid-cols-2
        xl:grid-cols-4 gap-1 auto-rows-min
      ">
        <Header />
        {children}
      </div>
      <Footer />
    </section>

    {/* MOBILE NAVIGATION */}
    <MobileNavigation />
  </div>
}
