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
  error?: Error | null
  retry?: () => void
}

const todayFormater = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric'
})
const otherDayFormater = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric'
})
const otherYear = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short'
})

const getDateString = (date: Date) => {
  const now = new Date()

  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  if (
    year === now.getFullYear() &&
    month === now.getMonth() &&
    day === now.getDate()
  ) {
    return todayFormater.format(date)
  } else if (year === now.getFullYear()) {
    return otherDayFormater.format(date)
  } else {
    return otherYear.format(date)
  }
}

export const NotificationWrapper = ({
  children,
  accept,
  reject,
  loading,
  acknowledged,
  date,
  error,
  retry
}: Props) => {
  const dateString = getDateString(new Date(date))

  return (
    <div
      className={twMerge(
        'p-2 lg:p-4 flex shadow-md gap-4 bg-theme-bottom rounded-md'
      )}
    >
      <p className="flex w-14 items-center justify-center text-xs text-theme-light">
        {dateString}
      </p>
      <section className={twMerge('flex-1 w-full')}>
        {children}
        {error && (
          <div role="alert">
            <p>{error.message}</p>
            {retry && (
              <Button size="sm" disabled={loading} onClick={retry}>
                Try again
              </Button>
            )}
          </div>
        )}
      </section>
      {acknowledged ? (
        <CheckCheck className="text-theme-light" size={14} />
      ) : loading ? (
        <Spinner size={14} />
      ) : (
        <>
          {accept ? (
            <Button
              aria-label="Accept invitation"
              className={'h-auto p-2'}
              disabled={loading}
              variant="default"
              onClick={accept}
            >
              <Check size={14} />
            </Button>
          ) : null}
          {reject ? (
            <Button
              aria-label="Reject invitation"
              className={'h-auto p-2'}
              disabled={loading}
              variant="destructive"
              onClick={reject}
            >
              <X size={14} />
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}
