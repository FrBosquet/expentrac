import { type Provider } from '@lib/prisma'
import { useState } from 'react'

import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

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

export const ProviderSelect = ({
  items,
  name,
  required,
  defaultValue = SELECT_OPTIONS.NONE
}: Props) => {
  const [currentValue, setCurrentValue] = useState<string>(
    defaultValue ?? SELECT_OPTIONS.NONE
  )
  const [newProvider, setNewProvider] = useState<Provider | null>(null)
  const [open, setOpen] = useState(false)

  const handleAddNewProvider = (provider: Provider) => {
    setNewProvider(provider)
    setCurrentValue(provider.id)
    setOpen(false)
  }

  const handleChange = (value: string) => {
    if (value === SELECT_OPTIONS.CREATE) {
      setOpen(true)
    } else if (value.length) {
      setCurrentValue(value)
    }
  }

  return (
    <>
      <ProviderDialog
        open={open}
        setOpen={setOpen}
        sideEffect={handleAddNewProvider}
      />

      <UiSelect
        name={name}
        required={required}
        value={currentValue}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full truncate">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-48 overflow-y-scroll">
          <SelectItem value={SELECT_OPTIONS.NONE}>None</SelectItem>
          <SelectItem value={SELECT_OPTIONS.CREATE}>Create</SelectItem>
          {newProvider ? (
            <SelectItem value={newProvider.id}>{newProvider.name}</SelectItem>
          ) : null}
          <Separator />
          {items.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </UiSelect>
    </>
  )
}
