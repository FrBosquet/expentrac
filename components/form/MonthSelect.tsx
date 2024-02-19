import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as UiSelect
} from '@/components/ui/select'
import { twMerge } from 'tailwind-merge'

interface Props {
  name: string
  required?: boolean
  className?: string
  defaultValue?: number | null
}

export const MonthSelect = ({ name, required, className, defaultValue }: Props) => {
  const now = new Date()

  return <UiSelect name={name} required={required} defaultValue={defaultValue?.toString() ?? now.getMonth().toString()}>
    <SelectTrigger className={twMerge('overflow-hidden whitespace-nowrap text-ellipsis w-full', className)}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="max-h-48 overflow-y-scroll">
      {Array(12).fill(null).map((_, index) => {
        const date = new Date(now)
        date.setMonth(index)

        return (
          <SelectItem key={index} value={(index).toString()} >
            {date.toLocaleString('default', {
              month: 'long'
            })}
          </SelectItem>
        )
      })}
    </SelectContent>
  </UiSelect>
}
