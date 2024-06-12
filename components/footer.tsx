import { Heart } from 'lucide-react'
import Link from 'next/link'

import { Logo } from './Logo'
import { NavigationLinks } from './NavigationLinks'

export const Footer = () => {
  return (
    <footer className="border-t border-theme-border bg-theme-back p-4 text-theme-light">
      <section className="m-auto flex w-full max-w-screen-md flex-col gap-8">
        <div className="flex justify-center gap-4">
          <Link className="flex items-baseline md:flex-1" href="/">
            <Logo className="text-2xl">ET</Logo>
            <p className="text-sm md:flex-1 ">alpha</p>
          </Link>
          <NavigationLinks />
        </div>

        <p className="text-center text-sm">
          ©2023 Expentrac. All rights reserved. Made with{' '}
          <Heart className="inline text-theme-accent" size={12} /> by{' '}
          <a className="text-theme-accent" href="https://x.com/FrBosquet">
            Fran Bosquet
          </a>
        </p>
      </section>
    </footer>
  )
}
