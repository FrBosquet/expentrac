import { SELECT_OPTIONS } from '@types'

import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

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

export const Select = ({
  items,
  name,
  required,
  defaultValue = SELECT_OPTIONS.NONE
}: Props) => {
  return (
    <UiSelect
      defaultValue={defaultValue ?? SELECT_OPTIONS.NONE}
      name={name}
      required={required}
    >
      <SelectTrigger className="w-full truncate">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={SELECT_OPTIONS.NONE}>None</SelectItem>
        <SelectItem value={SELECT_OPTIONS.CREATE}>Create</SelectItem>
        <Separator />
        {items.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  )
}
