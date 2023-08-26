import { cn } from '@lib/utils'
import { CreditCard, Landmark, ShoppingBag, type LucideIcon } from 'lucide-react'
import { type Dispatch, type MouseEvent, type SetStateAction } from 'react'
import { Tooltip } from './Tooltip'
import { Toggle } from './ui/toggle'

type Value = 'vendor' | 'platform' | 'lender'

interface Props {
  options: Array<{
    tooltip: string
    value: Value
  }>
  className?: string
  type: string | null
  setType: Dispatch<SetStateAction<string | null>>
}

const icons: Record<Value, LucideIcon> = {
  vendor: ShoppingBag,
  platform: CreditCard,
  lender: Landmark
}

export const ToggleSelect = ({ options, className, type, setType }: Props) => {
  const handleChange = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    e.preventDefault()
    const value = e.currentTarget.value

    setType(current => {
      if (current === value) {
        return null
      }
      return value
    })
  }

  return (
    <div className={cn('flex border p-1 border-slate-200 rounded-md', className)}>
      {
        options.map(({ tooltip, value }) => {
          const Icon = icons[value]

          return <Tooltip key={value} tooltip={tooltip}>
            <Toggle className='py-1' pressed={type === value} value={value} onClick={handleChange} aria-label={`toggle ${tooltip}`}>
              <Icon size={16} />
            </Toggle>
          </Tooltip>
        })
      }
    </div>
  )
}
