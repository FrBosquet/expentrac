import { Button } from '@components/ui/button'
import { Check, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface Props {
  children: React.ReactNode
  accept: () => void
  reject: () => void
  loading: boolean
  acknowledged?: boolean
}

export const Notification = ({ children, accept, reject, loading, acknowledged }: Props) => {
  return <div className={twMerge('p-2 flex shadow-md gap-2 bg-slate-100 rounded-md', acknowledged && 'opacity-60')}>
    <section className={twMerge('flex-1 w-full', loading && 'opacity-40')}>
      {children}
    </section>
    {
      acknowledged
        ? null
        : <>
          <Button disabled={loading} variant='default' className={'p-2 h-auto'} onClick={accept}><Check size={14} /></Button>
          <Button disabled={loading} variant='destructive' className={'p-2 h-auto'} onClick={reject}><X size={14} /></Button>
        </>
    }
  </div>
}
