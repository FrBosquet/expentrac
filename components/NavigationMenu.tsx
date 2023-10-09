'use client'

import Link from 'next/link'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'

const components: Array<{ title: string, href: string, description: string }> = [
  {
    title: 'Loans',
    href: '/dashboard/loans',
    description:
      'All the loans you ask for to buy cool things.'
  },
  {
    title: 'Subscriptions',
    href: '/dashboard/subscriptions',
    description:
      'All those cool services you are subscribed to.'
  },
  {
    title: 'Providers',
    href: '/dashboard/providers',
    description:
      'The companies and services that you use to buy, to pay or to get money from.'
  }
]

export function Navigation() {
  return (
    <NavigationMenu className="p-2 flex-grow-0">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/dashboard" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Dashboard
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Assets</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px] left-10">
              {components.map(({ title, href, description }) => (
                <Link
                  key={title}
                  title={title}
                  href={href}
                  className="p-2  rounded-md"
                >
                  <li>
                    <h5 className="font-semibold text-sm">{title}</h5>
                    <p className="text-xs ">{description}</p>
                  </li>
                </Link>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  )
}
