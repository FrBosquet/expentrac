'use client'

import { type PublicUser } from '@lib/models'
import { useUserSearch } from '@hooks/search'
import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface Props {
  onSelect: (user: PublicUser) => void
  selectedUsers: PublicUser[]
}

export function UserSearch({ onSelect, selectedUsers }: Props) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const { query, results, searching, enabled } = useUserSearch(value, open)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-[200px] justify-between font-normal"
          role="combobox"
          variant="outline"
        >
          Find mates
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="write its email"
            value={value}
            onValueChange={setValue}
          />
          {searching && (
            <div role="status" className="p-3">
              Searching…
            </div>
          )}
          {enabled && query.isError && (
            <div role="alert" className="p-3">
              <p>{query.error.message}</p>
              <button
                type="button"
                onClick={() => {
                  void query.refetch()
                }}
              >
                Try again
              </button>
            </div>
          )}
          {!searching && !query.isError && (
            <CommandEmpty>
              {value.trim().length < 3
                ? 'At least three characters'
                : 'No user found.'}
            </CommandEmpty>
          )}
          <CommandGroup>
            {results.map((user) => (
              <CommandItem
                key={user.id}
                className="flex cursor-pointer flex-col items-start data-[disabled]:opacity-40"
                disabled={selectedUsers.some((u) => u.id === user.id)}
                onSelect={() => {
                  onSelect(user)
                  setOpen(false)
                  setValue('')
                }}
              >
                {user.name}
                <span className="text-xs text-slate-400">{user.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
