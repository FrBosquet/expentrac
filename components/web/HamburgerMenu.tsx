'use client'

import { Logo } from '@components/Logo'
import { handleSignIn } from '@components/hero/signin'
import { Button } from '@components/ui/button'
import { Separator } from '@components/ui/separator'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { AiOutlineGoogle } from 'react-icons/ai'
import { twMerge } from 'tailwind-merge'

export const HambugerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => {
    setIsOpen(prev => !prev)
  }

  return <div className='block md:hidden'>
    <Button variant="link" className='p-0' onClick={toggle}><Menu className='text-slate-300' /></Button>
    <aside className={twMerge('flex flex-col gap-6 p-8 fixed z-50 h-screen w-screen bg-slate-900 top-0 left-0 shadow-md items-end transition-[left]', isOpen ? 'left-0' : 'left-[100%]')}>
      <Button variant='link' className='self-start p-0' onClick={toggle}><X size={40} className='text-slate-300' /></Button>
      <nav className='flex flex-col gap-4 mt-8'>
        <Link onClick={toggle} href='/' className='text-slate-300 text-4xl uppercase tracking-wider text-right'>Home</Link>
        <Link onClick={toggle} href='/blog' className='text-slate-300 text-4xl uppercase tracking-wider text-right'>Blog</Link>
        <Link onClick={toggle} href='/pricing' className='text-slate-300 text-4xl uppercase tracking-wider text-right'>Pricing</Link>
        <Link onClick={toggle} href='/team' className='text-slate-300 text-4xl uppercase tracking-wider text-right'>Team</Link>
      </nav>
      <Separator />
      <div className="flex-1"></div>
      <Button className='text-primary-300 text-4xl uppercase tracking-wider p-0 flex gap-4' variant="link" onClick={handleSignIn}><AiOutlineGoogle /> Log in</Button>
      <Logo className='text-4xl self-start'>ET</Logo>
    </aside>
  </div>
}
