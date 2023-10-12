'use client'

import { CircleDollarSign, Landmark, LayoutDashboard, PencilLine, Tv } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Logo } from './Logo'
import { useUser } from './Provider'
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

  return <aside className='group bg-card py-10 flex flex-col items-center gap-10 fixed h-screen border-r shadow-xl z-50
      w-20 hover:w-56 transition-all overflow-hidden
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

export function NavigationMenu({ children }: Props) {
  return <div className='flex w-full'>
    {/* SIDEBAR */}
    <Sidebar />

    {/* PAGE CONTENT */}
    <section className='flex-1 min-h-screen flex flex-col
      pl-20 xl:pl-56
    '>
      {children}
    </section>
  </div>
}
