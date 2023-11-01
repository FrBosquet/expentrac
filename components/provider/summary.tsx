'use client'

import { ToggleSelect } from '@components/ToggleSelect'
import { Input } from '@components/ui/input'
import { Search } from 'lucide-react'
import { useMemo, useState, type ChangeEvent } from 'react'
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

  const filteredProviders = useMemo(() => providers.filter(({ name }) => {
    return name.toLowerCase().includes(nameFilter.toLowerCase())
  }), [nameFilter, providers])

  return <div className={twMerge('flex flex-col gap-4', className)}>
    <section className='grid grid-cols-[1fr_auto] gap-2 items-center relative'>
      <Search size={16} className='text-foreground absolute left-4' />
      <Input className='h-full pl-12' value={nameFilter} onChange={handleChange} placeholder="Filter by name" />
      <ToggleSelect type={type} setType={setType} options={[
        { tooltip: 'as vendor', value: 'vendor' },
        { tooltip: 'as platform', value: 'platform' },
        { tooltip: 'as lender', value: 'lender' }
      ]} />
    </section>
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {filteredProviders.map((userProvider) => {
        return <UserProviderCard key={userProvider.id} provider={userProvider} />
      })}
    </section>
  </div>
}
