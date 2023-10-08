import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as UiSelect
} from '@/components/ui/select'
import { SELECT_OPTIONS } from '@types'
import { Separator } from './ui/separator'

interface Props {
  items: Array<{
    value: string
    label: string
  }>
  name: string
  required?: boolean
  defaultValue?: string | null
}

export const Select = ({ items, name, required, defaultValue = SELECT_OPTIONS.NONE }: Props) => {
  return <UiSelect defaultValue={defaultValue ?? SELECT_OPTIONS.NONE} name={name} required={required}>
    <SelectTrigger className="overflow-hidden whitespace-nowrap text-ellipsis w-full">
      <SelectValue />
    </SelectTrigger>
    <SelectContent >
      <SelectItem value={SELECT_OPTIONS.NONE}>None</SelectItem>
      <SelectItem value={SELECT_OPTIONS.CREATE}>Create</SelectItem>
      <Separator />
      {items.map(({ value, label }) => (
        <SelectItem key={value} value={value} >
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </UiSelect>
}
