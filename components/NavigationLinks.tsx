import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface Props {
  className?: string
}

export const NavigationLinks = ({ className }: Props) => {
  return (
    <menu className={twMerge('gap-4 hidden sm:flex', className)}>
      <Link
        className="uppercase text-theme-light transition hover:text-theme-front"
        href="/blog"
      >
        Blog
      </Link>
      <Link
        className="uppercase text-theme-light transition hover:text-theme-front"
        href="/pricing"
      >
        Pricing
      </Link>
      <Link
        className="uppercase text-theme-light transition hover:text-theme-front"
        href="/team"
      >
        Team
      </Link>
    </menu>
  )
}
