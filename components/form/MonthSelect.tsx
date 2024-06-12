import { twMerge } from 'tailwind-merge'

import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface Props {
  name: string
  required?: boolean
  className?: string
  defaultValue?: number | null
}

export const MonthSelect = ({
  name,
  required,
  className,
  defaultValue
}: Props) => {
  const now = new Date()

  return (
    <UiSelect
      defaultValue={defaultValue?.toString() ?? now.getMonth().toString()}
      name={name}
      required={required}
    >
      <SelectTrigger
        className={twMerge(
          'overflow-hidden whitespace-nowrap text-ellipsis w-full',
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-48 overflow-y-scroll">
        {Array(12)
          .fill(null)
          .map((_, index) => {
            const date = new Date(now)
            date.setMonth(index)

            return (
              <SelectItem key={index} value={index.toString()}>
                {date.toLocaleString('default', {
                  month: 'long'
                })}
              </SelectItem>
            )
          })}
      </SelectContent>
    </UiSelect>
  )
}
