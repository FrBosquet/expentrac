import { type User } from '@lib/prisma'
import { getUsersByEmail } from '@sdk/user'
import { ChevronsUpDown } from 'lucide-react'
import { type ChangeEvent, useCallback, useRef, useState } from 'react'

import { useUser } from './Provider'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Spinner } from './ui/spinner'

interface Props {
  onSelect: (user: User) => void
  selectedUsers: User[]
}

export function UserSearch({ onSelect, selectedUsers }: Props) {
  const debounce = useRef<any>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')
  const [options, setOptions] = useState<any[]>([])
  const { user } = useUser()

  const fetchUsersByEmail = useCallback(
    async (search: string) => {
      if (debounce.current) clearTimeout(debounce.current)

      if (search.length < 2) {
        setOptions([])
        return
      }

      debounce.current = setTimeout(async () => {
        setLoading(true)
        const users = await getUsersByEmail(search)

        const optionList = users
          .filter(({ id }) => id !== user.id)
          .map((user) => ({
            value: user.email,
            label: user.name,
            user
          }))

        setOptions(optionList)
        setLoading(false)
      }, 170)
    },
    [user.id]
  )

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value

    setValue(search)

    await fetchUsersByEmail(search)
  }

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
        <Command shouldFilter={false} onChange={handleChange}>
          <CommandInput placeholder="write its email" />
          <CommandEmpty>
            {!loading &&
              (value.length < 2 ? 'At least two chars' : 'No user found.')}
          </CommandEmpty>
          {loading ? (
            <div className="flex w-full justify-center pb-2 text-slate-600">
              <Spinner />
            </div>
          ) : null}
          <CommandGroup>
            {options.map((user) => (
              <CommandItem
                key={user.value}
                className="flex cursor-pointer flex-col items-start data-[disabled]:opacity-40"
                data-disabled={selectedUsers.find((u) => u.id === user.user.id)}
                onSelect={() => {
                  onSelect(user.user)
                  setOpen(false)
                  setOptions([])
                }}
              >
                {user.label}
                <span className="text-xs text-slate-400">{user.value}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
