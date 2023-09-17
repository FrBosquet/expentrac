import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Logo } from './Logo'
import { NavigationLinks } from './NavigationLinks'

export const Footer = () => {
  return <footer className="p-4 border-t border-slate-600 bg-slate-950">
    <section className='max-w-screen-md w-full m-auto flex flex-col gap-8'>
      <div className="flex justify-center">
        <Link href="/" className='md:flex-1 flex items-baseline'>
          <Logo className='text-2xl'>ET</Logo>
          <p className='md:flex-1 text-sm text-slate-500'>alpha</p>
        </Link>
        <NavigationLinks />
      </div>

      <p className='text-slate-500 text-sm text-center'>©2023 Expentrac. All rights reserved. Made with <Heart className='inline text-secondary' /> by <a className='text-primary visited:text-secondary' href='https://x.com/FrBosquet'>Fran Bosquet</a></p>
    </section>
  </footer>
}
