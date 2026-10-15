'use client'
import { RowsSkeleton } from '@components/dashboard/skeletons'

import { Search, ServerOff, X } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useState } from 'react'
import { useBrandSearch } from '@hooks/search'
import { type Brand } from '@sdk/brands'
export type { Brand } from '@sdk/brands'

import { Spinner } from './ui/spinner'

export interface Autocomplete {
  value: string
  query?: Brand
  queries: Brand[]
}

interface Props {
  onSelect: (value: Brand) => void
  loading?: boolean
}

export const BrandAutocomplete = ({ loading = false, onSelect }: Props) => {
  const [value, setValue] = useState({
    text: '',
    active: false,
    brand: null as Brand | null
  })
  const {
    query: search,
    results: queries,
    searching,
    enabled
  } = useBrandSearch(value.text, value.active && !loading)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const text = queries?.[0]?.domain || value.text
    setValue({ text, active: false, brand: null })
  }

  const handleClick = (brand: Brand) => {
    setValue({ text: '', active: false, brand })
    onSelect(brand)
  }

  const reset = () => {
    setValue({ text: '', active: false, brand: null })
  }

  return (
    <div className="relative flex flex-col gap-2">
      <form onSubmit={handleSubmit}>
        <fieldset
          className="flex w-full items-center rounded-md border outline-1 outline-primary focus-within:outline "
          disabled={loading}
        >
          <label className="p-2">
            {loading ? (
              <Spinner className="text-slate-300" />
            ) : (
              <Search className="text-slate-500" />
            )}
          </label>

          <input
            className="flex-1 py-2 pl-2 transition-[padding-left] focus:pl-4 focus:outline-hidden disabled:bg-white dark:bg-slate-700"
            placeholder={
              loading ? `creating ${value.brand?.name}...` : 'search a provider'
            }
            value={value.text}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setValue({ text: e.target.value, active: true, brand: null })
            }}
          />

          {value.text !== '' && (
            <label
              className="cursor-pointer p-2 text-slate-500"
              onClick={() => {
                reset()
              }}
            >
              <X />
            </label>
          )}
        </fieldset>
      </form>

      <div>
        {value.active && value.text !== '' && (
          <div className="absolute inset-x-0 max-h-[200px] overflow-y-auto rounded-md border  bg-background p-2 shadow-lg">
            {searching ? (
              <div className="p-3">
                <RowsSkeleton label="Searching brands" rows={2} />
              </div>
            ) : enabled && search.isError ? (
              <div role="alert" className="p-3">
                <p>{search.error.message}</p>
                <button
                  type="button"
                  onClick={() => {
                    void search.refetch()
                  }}
                >
                  Try again
                </button>
              </div>
            ) : value.text.trim().length < 2 ? (
              <p className="p-3">At least two characters</p>
            ) : queries.length > 0 ? (
              <div className="flex flex-col gap-1">
                {queries.map((query, i) => (
                  <div
                    key={i}
                    className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-center justify-center gap-2 rounded-md p-1 text-sm hover:bg-slate-300 hover:text-primary dark:hover:bg-slate-700"
                    onClick={() => {
                      handleClick(query)
                    }}
                  >
                    <div className="relative size-10 overflow-hidden rounded-md shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={query.name}
                        className="absolute inset-0 size-full object-cover"
                        src={query.icon}
                      />
                    </div>

                    <p className="overflow-hidden">
                      {query.name || query.domain}
                    </p>

                    <p className="text-slate-500">{query.domain}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center p-2">
                <div className="p-2">
                  <ServerOff />
                </div>
                <p className="font-bold text-slate-600">Nothing found...</p>
                <p className="text-xs text-slate-500">
                  Search by entering it’s website URL for better result.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="w-full text-center text-xs text-slate-300">
        Provided by{' '}
        <a href="https://brandfetch.com/" rel="noreferrer" target="_blank">
          Brandfetch
        </a>
      </p>
    </div>
  )
}
