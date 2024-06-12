'use client'

import { handleSignIn } from '@components/hero/signin'
import { Logo } from '@components/Logo'
import { Button } from '@components/ui/button'
import { Separator } from '@components/ui/separator'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { AiOutlineGoogle } from 'react-icons/ai'
import { twMerge } from 'tailwind-merge'

// TODO: Hamburger is not sticky because the wheels perspective prevents that. Rework the wheel to stop the perspective bullshit
export const HambugerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <div className="block md:hidden">
      <Button className="p-0" variant="link" onClick={toggle}>
        <Menu className="text-slate-300" />
      </Button>
      <aside
        className={twMerge(
          'flex flex-col gap-6 p-8 fixed z-50 h-screen w-screen bg-slate-900 top-0 left-0 shadow-md items-end transition-[left]',
          isOpen ? 'left-0' : 'left-[100%]'
        )}
      >
        <Button className="self-start p-0" variant="link" onClick={toggle}>
          <X className="text-slate-300" size={40} />
        </Button>
        <nav className="mt-8 flex flex-col gap-4">
          <Link
            className="text-right text-4xl uppercase tracking-wider text-slate-300"
            href="/"
            onClick={toggle}
          >
            Home
          </Link>
          <Link
            className="text-right text-4xl uppercase tracking-wider text-slate-300"
            href="/blog"
            onClick={toggle}
          >
            Blog
          </Link>
          <Link
            className="text-right text-4xl uppercase tracking-wider text-slate-300"
            href="/pricing"
            onClick={toggle}
          >
            Pricing
          </Link>
          <Link
            className="text-right text-4xl uppercase tracking-wider text-slate-300"
            href="/team"
            onClick={toggle}
          >
            Team
          </Link>
        </nav>
        <Separator />
        <div className="flex-1"></div>
        <Button
          className="flex gap-4 p-0 text-4xl uppercase tracking-wider text-primary-300"
          variant="link"
          onClick={handleSignIn}
        >
          <AiOutlineGoogle /> Log in
        </Button>
        <Logo className="self-start text-4xl">ET</Logo>
      </aside>
    </div>
  )
}
