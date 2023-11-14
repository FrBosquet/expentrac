import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'
import { Check, CheckCheck, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface Props {
  children: React.ReactNode
  accept?: () => void
  reject?: () => void
  loading: boolean
  acknowledged?: boolean
  date: Date
}

const todayFormater = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' })
const otherDayFormater = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const otherYear = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' })

const getDateString = (date: Date) => {
  const now = new Date()

  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  if (year === now.getFullYear() && month === now.getMonth() && day === now.getDate()) {
    return todayFormater.format(date)
  } else if (year === now.getFullYear()) {
    return otherDayFormater.format(date)
  } else {
    return otherYear.format(date)
  }
}

export const NotificationWrapper = ({ children, accept, reject, loading, acknowledged, date }: Props) => {
  const dateString = getDateString(new Date(date))

  return <div className={twMerge('p-2 lg:p-4 flex shadow-md gap-4 bg-theme-bottom rounded-md')}>
    <p className='text-xs flex items-center justify-center w-14 text-theme-light'>
      {dateString}
    </p>
    <section className={twMerge('flex-1 w-full')}>
      {children}
    </section>
    {
      acknowledged
        ? <CheckCheck size={14} className='text-theme-light' />
        : loading
          ? <Spinner size={14} />
          : <>
            {accept ? <Button disabled={loading} variant='default' className={'p-2 h-auto'} onClick={accept}><Check size={14} /></Button> : null}
            {reject ? <Button disabled={loading} variant='destructive' className={'p-2 h-auto'} onClick={reject}><X size={14} /></Button> : null}
          </>
    }
  </div>
}
