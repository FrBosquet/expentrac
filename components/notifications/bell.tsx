'use client'

import { Skeleton } from '@components/ui/skeleton'
import { Bell, BellRing } from 'lucide-react'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

import { useNotifications } from './context'

export const NotificationBell = ({
  className,
  onClick
}: {
  className?: string
  onClick?: () => void
}) => {
  const { hasPending, pending, isPending, error } = useNotifications()

  return (
    <Link
      aria-label={
        isPending
          ? 'Loading notifications'
          : error
            ? 'Notifications unavailable; open to retry'
            : pending > 0
              ? `${pending} unread notifications`
              : 'Notifications'
      }
      aria-busy={isPending}
      className={twMerge('relative', className)}
      href="/dashboard/notifications"
      onClick={onClick}
    >
      {isPending ? (
        <Skeleton className="size-6 rounded-full" />
      ) : hasPending ? (
        <>
          <BellRing />
          <div className="absolute -right-2 -top-2 grid size-[1.1rem] place-content-center rounded-full  bg-amber-600 text-xs font-bold text-slate-50">
            {pending}
          </div>
        </>
      ) : (
        <Bell />
      )}
    </Link>
  )
}
