'use client'

import { ToggleSelect } from '@components/ToggleSelect'
import { Input } from '@components/ui/input'
import { Search } from 'lucide-react'
import { type ChangeEvent, useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { UserProviderCard } from './card'
import { useProviders } from './context'

interface Props {
  className?: string
}

export const UserProviderSummary = ({ className }: Props) => {
  const [nameFilter, setNameFilter] = useState('')
  const [type, setType] = useState<null | string>(null)

  const { providers } = useProviders()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value)
  }

  const filteredProviders = useMemo(
    () =>
      providers.filter(({ name }) => {
        return name.toLowerCase().includes(nameFilter.toLowerCase())
      }),
    [nameFilter, providers]
  )

  return (
    <div className={twMerge('flex flex-col gap-4', className)}>
      <section className="relative grid grid-cols-[1fr_auto] items-center gap-2">
        <Search className="absolute left-4 text-foreground" size={16} />
        <Input
          className="h-full pl-12"
          placeholder="Filter by name"
          value={nameFilter}
          onChange={handleChange}
        />
        <ToggleSelect
          options={[
            { tooltip: 'as vendor', value: 'vendor' },
            { tooltip: 'as platform', value: 'platform' },
            { tooltip: 'as lender', value: 'lender' }
          ]}
          setType={setType}
          type={type}
        />
      </section>
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {filteredProviders.map((userProvider) => {
          return (
            <UserProviderCard key={userProvider.id} provider={userProvider} />
          )
        })}
      </section>
    </div>
  )
}
