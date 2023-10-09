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

export function NavigationMenu({ children }: Props) {
  const pathname = usePathname()
  const { user } = useUser()

  return <div className='flex w-full'>
    <aside className='bg-card py-10 flex flex-col items-center gap-10 fixed h-screen w-56 border-r shadow-xl'>
      <Logo className='text-3xl -tracking-widest px-6 self-start'>expentrac</Logo>
      <article className='flex flex-col gap-1 items-center w-full'>
        <UserMenu />
        <h2 className='text-lg pt-4'>{user.name}</h2>
        <p className='text-theme-light leading-[0.35rem]'>user</p>
      </article>
      <menu className='flex-1 flex flex-col w-full'>
        {
          components.map((component) => {
            if (typeof component === 'string') {
              return <Separator key={component} />
            }

            const { title, href, Icon } = component
            const isSelected = href === pathname

            return <Link aria-disabled={isSelected} key={title} href={href} className={twMerge('px-6 py-3 transition font-semibold text-sm uppercase hover:text-expentrac-800 hover:bg-theme-back dark:hover:text-expentrac flex items-center gap-2', isSelected && 'bg-theme-back text-expentrac-800 dark:text-expentrac-300 pointer-events-none')}><Icon size={16} /> {title}</Link>
          })
        }

      </menu>
    </aside>
    <section className='flex-1 pl-56'>
      {children}
    </section>
  </div>

  // return (
  //   <NVPrimitive className="p-2 flex-grow-0">
  //     <NavigationMenuList>
  //       <NavigationMenuItem>
  //         <Link href="/dashboard" legacyBehavior passHref>
  //           <NavigationMenuLink className={navigationMenuTriggerStyle()}>
  //             Dashboard
  //           </NavigationMenuLink>
  //         </Link>
  //       </NavigationMenuItem>

  //       <NavigationMenuItem>
  //         <NavigationMenuTrigger>Assets</NavigationMenuTrigger>
  //         <NavigationMenuContent>
  //           <ul className="grid w-[400px] gap-3 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px] left-10">
  //             {components.map(({ title, href, description }) => (
  //               <Link
  //                 key={title}
  //                 title={title}
  //                 href={href}
  //                 className="p-2  rounded-md"
  //               >
  //                 <li>
  //                   <h5 className="font-semibold text-sm">{title}</h5>
  //                   <p className="text-xs ">{description}</p>
  //                 </li>
  //               </Link>
  //             ))}
  //           </ul>
  //         </NavigationMenuContent>
  //       </NavigationMenuItem>

  //     </NavigationMenuList>
  //   </NVPrimitive>
  // )
}
