'use client'

import {
  Bell,
  BellRing
} from 'lucide-react'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import { useNotifications } from './context'

export const NotificationBell = ({ className, onClick }: { className?: string, onClick?: () => void }) => {
  const { hasPending, pending } = useNotifications()

  return <Link href='/dashboard/notifications' className={twMerge('relative', className)} onClick={onClick}>
    {hasPending
      ? <>
        <BellRing />
        <div className='h-[1.1rem] w-[1.1rem] absolute -top-2 -right-2 bg-amber-600 text-slate-50  rounded-full grid place-content-center text-xs font-bold'>
          {pending}
        </div>
      </>
      : <Bell />
    }
  </Link>
}
