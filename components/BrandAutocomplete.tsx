'use client'

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent
} from 'react'

import { Search, ServerOff, X } from 'lucide-react'
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
  const [value, setValue] = useState({ text: '', active: false, brand: null as Brand | null })
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
      <form aria-disabled={loading} onSubmit={handleSubmit}>
        <fieldset disabled={loading} className="border flex items-center w-full rounded-md outline-1 focus-within:outline outline-primary " >
          <label className="p-2">
            {loading ? <Spinner className="text-slate-300" /> : <Search className="text-slate-500" />}
          </label>

          <input
            className="flex-1 py-2 focus:outline-none focus:pl-2 transition-[padding-left] disabled:bg-white"
            placeholder={loading ? `creating ${value.brand?.name}...` : 'search a provider'}
            value={value.text}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setValue({ text: e.target.value, active: true, brand: null }) }
            }
          />

          {value.text !== '' && (
            <label className="p-2 text-slate-500 cursor-pointer" onClick={() => { reset() }}>
              <X />
            </label>
          )}
        </fieldset>
      </form>

      <div>
        {value.active && value.text !== '' && (
          <div className="shadow-lg border border-slate-200 rounded-md bg-white p-2 absolute right-0 left-0 max-h-[200px] overflow-y-auto">
            {(queries.length > 0)
              ? (
                <div className="flex flex-col gap-1">
                  {queries.map((query, i) => (
                    <div className="grid grid-cols-[auto_1fr_auto] gap-2 rounded-md text-sm justify-center items-center cursor-pointer hover:bg-slate-100 hover:text-primary p-1" key={i} onClick={() => { handleClick(query) }}>
                      <div className="shadow-sm rounded-md h-10 w-10 overflow-hidden relative">
                        <img className="absolute h-full w-full inset-0 object-cover" src={query.icon} alt={query.name} />
                      </div>

                      <p className="overflow-hidden">{query.name || query.domain}</p>

                      <p className="text-slate-500">{query.domain}</p>
                    </div>
                  ))}
                </div>)
              : (
                <div className="flex flex-col items-center p-2">
                  <div className="p-2">
                    <ServerOff />
                  </div>
                  <p className="font-bold text-slate-600">Nothing found...</p>
                  <p className="text-slate-500 text-xs">Search by entering it’s website URL for better result.</p>
                </div>)}
          </div>
        )}
      </div>

      <p className="text-slate-300 text-xs w-full text-center">
        Provided by{' '}
        <a href="https://brandfetch.com/" rel="noreferrer" target="_blank">
          Brandfetch
        </a>
      </p>
    </div>
  )
}
