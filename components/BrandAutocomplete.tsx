'use client'

import { Search, ServerOff, X } from 'lucide-react'
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useState
} from 'react'

import { Spinner } from './ui/spinner'

export interface Brand {
  name: string
  domain: string
  icon: string
  brandId: string
}

export interface Autocomplete {
  value: string
  query?: Brand
  queries: Brand[]
}

interface Props {
  onSelect: (value: Brand) => void
  loading?: boolean
}

export const BrandAutocomplete = ({ loading = true, onSelect }: Props) => {
  const [value, setValue] = useState({
    text: '',
    active: false,
    brand: null as Brand | null
  })
  const [queries, setQueries] = useState<Brand[]>([])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const text = queries?.[0]?.domain || value.text
    setValue({ text, active: false, brand: null })
    setQueries([])
  }

  const handleClick = (brand: Brand) => {
    setValue({ text: '', active: false, brand })
    onSelect(brand)
  }

  const reset = () => {
    setQueries([])
    setValue({ text: '', active: false, brand: null })
  }

  const getQueries = useCallback(async (searchValue: string) => {
    if (searchValue !== '') {
      try {
        const url = `https://api.brandfetch.io/v2/search/${searchValue}`

        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setQueries(data)
        }
      } catch (err) {
        // TODO: Add a toast notification
        // eslint-disable-next-line no-console
        console.error('Something went wrong, try again later.')
      }
      return
    }

    setQueries([])
  }, [])

  useEffect(() => {
    void getQueries(value.text)
  }, [getQueries, value.text])

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
            className="flex-1 py-2 transition-[padding-left] focus:pl-2 focus:outline-none disabled:bg-white"
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
          <div className="absolute inset-x-0 max-h-[200px] overflow-y-auto rounded-md border border-slate-200 bg-white p-2 shadow-lg">
            {queries.length > 0 ? (
              <div className="flex flex-col gap-1">
                {queries.map((query, i) => (
                  <div
                    key={i}
                    className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-center justify-center gap-2 rounded-md p-1 text-sm hover:bg-slate-100 hover:text-primary"
                    onClick={() => {
                      handleClick(query)
                    }}
                  >
                    <div className="relative size-10 overflow-hidden rounded-md shadow-sm">
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
