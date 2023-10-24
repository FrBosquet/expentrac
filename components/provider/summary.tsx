'use client'

import { ToggleSelect } from '@components/ToggleSelect'
import { Input } from '@components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useMemo, useState, type ChangeEvent } from 'react'
import { ProviderAdd } from './add'
import { UserProviderCard } from './card'
import { useProviders } from './context'

export const UserProviderSummary = () => {
  const [nameFilter, setNameFilter] = useState('')
  const [type, setType] = useState<null | string>(null)

  const { providers } = useProviders()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value)
  }

  const filteredProviders = useMemo(() => providers.filter(({ name }) => {
    // Recover filter by type
    return name.toLowerCase().includes(nameFilter.toLowerCase())
  }), [nameFilter, providers])

  return <div className='flex flex-col gap-4'>
    <section className='grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center'>
      <Search size={16} className='text-slate-500' />
      <Input className='h-full' value={nameFilter} onChange={handleChange} placeholder="Filter by name" />
      <ToggleSelect type={type} setType={setType} options={[
        { tooltip: 'as vendor', value: 'vendor' },
        { tooltip: 'as platform', value: 'platform' },
        { tooltip: 'as lender', value: 'lender' }
      ]} />
      <ProviderAdd className='h-full'>
        <Plus size={14} />
      </ProviderAdd>
    </section>
    <section className="grid grid-cols-3 gap-4">
      {filteredProviders.map((userProvider) => {
        return <UserProviderCard key={userProvider.id} provider={userProvider} />
      })}
    </section>
  </div>
}
