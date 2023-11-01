import { type Provider } from '@lib/prisma'
import { getProviderLink } from '@lib/provider'
import { cn } from '@lib/utils'
import { CircleOff } from 'lucide-react'
import { Tooltip } from './Tooltip'
import { ProviderLogo } from './provider/ProviderLogo'

export const ProviderDetail = ({ provider, label, className }: { provider?: Provider, label: string, className: string }) => {
  const exist = provider != null

  if (!exist) {
    return (
      <article className={cn('flex items-center justify-center flex-col gap-2', className)}>
        <h4 className={cn('text-xs font-semibold text-center', exist ? 'text-slate-800' : 'text-slate-400')}>{label}</h4>
        <CircleOff className="text-slate-400 flex-1 h-16" />
      </article>
    )
  }

  return (
    <Tooltip side="bottom" tooltip={<div>
      <h3 className='font-semibold'>{provider.name}</h3>
      <p className='text-xs text-slate-500'>click to visit {getProviderLink(provider)}</p>
    </div>}>
      <article className={cn('flex items-center justify-center flex-col gap-2', className)}>
        <h4 className={cn('text-xs font-semibold text-center', exist ? 'text-theme-accent' : 'text-theme-light')}>{label}</h4>
        <a href={getProviderLink(provider)} target="_blank" rel="noreferrer" ><ProviderLogo className="h-12 w-12" provider={provider} /></a>
      </article>
    </Tooltip>
  )
}
