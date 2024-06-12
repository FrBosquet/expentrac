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

export const DaySelect = ({
  name,
  required,
  className,
  defaultValue
}: Props) => {
  return (
    <UiSelect
      defaultValue={defaultValue?.toString() ?? '0'}
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
        {!required && <SelectItem value={'0'}>Not defined</SelectItem>}
        {Array(31)
          .fill(null)
          .map((_, index) => (
            <SelectItem key={index} value={(index + 1).toString()}>
              {index + 1}
            </SelectItem>
          ))}
      </SelectContent>
    </UiSelect>
  )
}
