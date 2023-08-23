import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as UiSelect
} from '@/components/ui/select'
import { useState } from 'react'
import { ProviderDialog } from './provider/add'
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

export enum SELECT_OPTIONS {
  NONE = 'NONE',
  CREATE = 'CREATE'
}

export const ProviderSelect = ({ items, name, required, defaultValue = SELECT_OPTIONS.NONE }: Props) => {
  const [currentValue, setCurrentValue] = useState<string>(defaultValue ?? SELECT_OPTIONS.NONE)
  const [open, setOpen] = useState(false)

  const handleChange = (value: string) => {
    if (value === SELECT_OPTIONS.CREATE) {
      setOpen(true)
    } else if (value.length) {
      setCurrentValue(value)
    }
  }

  return <>
    <ProviderDialog open={open} setOpen={setOpen} sideEffect={(userProvider) => { setCurrentValue(userProvider.id) }} />

    <UiSelect onValueChange={handleChange} value={currentValue} name={name} required={required}>
      <SelectTrigger className="overflow-hidden whitespace-nowrap text-ellipsis w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-48 overflow-y-scroll">
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
  </>
}
