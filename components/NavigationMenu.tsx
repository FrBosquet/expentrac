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

  return <aside className='bg-card py-10 flex flex-col items-center gap-10 fixed h-screen border-r shadow-xl z-50
      w-20 xl:w-56
    '>
    <Logo className='text-3xl -tracking-widest px-6 self-start hidden xl:block'>expentrac</Logo>
    <article className='flex flex-col gap-1 items-center w-full'>
      <UserMenu className='xl:w-20 xl:h-20' />
      <h2 className='text-lg pt-4 hidden xl:block'>{loading ? '...' : user.name}</h2>
    </article>
    <menu className='flex-1 flex flex-col w-full'>
      {
        components.map((component) => {
          if (typeof component === 'string') {
            return <Separator key={component} />
          }

          const { title, href, Icon } = component
          const isSelected = href === pathname

          return <Link aria-disabled={isSelected} key={title} href={href} className={twMerge('group relative px-6 h-12 transition font-semibold text-sm uppercase hover:text-expentrac-800 hover:bg-theme-back dark:hover:text-expentrac flex items-center gap-2 hover:border xl:hover:border-0', isSelected && 'bg-theme-back text-expentrac-800 dark:text-expentrac-300 pointer-events-none')}>
            <Icon className='shrink-0 w-8 xl:w-4' />
            <p className='
              opacity-20 bg-theme-back h-full flex items-center scale-x-0 origin-left transition pr-4
              group-hover:opacity-100 group-hover:scale-x-100

              xl:opacity-100 xl:scale-x-100 xl:bg-transparent xl:pr-0
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
