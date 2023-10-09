import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Logo } from './Logo'
import { NavigationLinks } from './NavigationLinks'

export const Footer = () => {
  return <footer className="p-4 border-t border-theme-border text-theme-light bg-theme-back">
    <section className='max-w-screen-md w-full m-auto flex flex-col gap-8'>
      <div className="flex justify-center">
        <Link href="/" className='md:flex-1 flex items-baseline'>
          <Logo className='text-2xl'>ET</Logo>
          <p className='md:flex-1 text-sm '>alpha</p>
        </Link>
        <NavigationLinks />
      </div>

      <p className='text-sm text-center'>©2023 Expentrac. All rights reserved. Made with <Heart size={12} className='inline text-theme-accent' /> by <a className='text-theme-accent' href='https://x.com/FrBosquet'>Fran Bosquet</a></p>
    </section>
  </footer>
}
