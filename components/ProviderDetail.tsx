import { getProviderLink } from '@lib/provider'
import { cn } from '@lib/utils'
import { type Provider } from '@prisma/client'
import { CircleOff } from 'lucide-react'
import { ProviderLogo } from './provider/ProviderLogo'

export const ProviderDetail = ({ provider, label, className }: { provider?: Provider, label: string, className: string }) => {
  const exist = provider != null

  return (
    <article className={cn('flex items-center justify-center flex-col gap-2', className)}>
      <h4 className={cn('text-xs font-semibold text-center', exist ? 'text-slate-800' : 'text-slate-400')}>{label}</h4>
      {exist
        ? <a href={getProviderLink(provider)} target="_blank" rel="noreferrer" ><ProviderLogo className="h-12 w-12" provider={provider} /></a>
        : <CircleOff className="text-slate-400 flex-1" />}
    </article>
  )
}
