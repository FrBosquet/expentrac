import { type Provider } from '@lib/prisma'
import { getProviderLink } from '@lib/provider'
import { cn } from '@lib/utils'
import { CircleOff } from 'lucide-react'

import { ProviderLogo } from './provider/ProviderLogo'
import { Tooltip } from './Tooltip'

export const ProviderDetail = ({
  provider,
  label,
  className,
  withName
}: {
  provider?: Provider
  label: string
  className: string
  withName?: boolean
}) => {
  const exist = provider != null

  if (!exist) {
    return (
      <article
        className={cn(
          'flex items-center justify-center flex-col gap-2',
          className
        )}
      >
        <h4 className={'dashboard-label'}>{label}</h4>
        <CircleOff className="h-16 flex-1 text-slate-400" />
      </article>
    )
  }

  return (
    <Tooltip
      side="bottom"
      tooltip={
        <div>
          <h3 className="font-semibold">{provider.name}</h3>
          <p className="text-xs text-slate-500">
            click to visit {getProviderLink(provider)}
          </p>
        </div>
      }
    >
      <article
        className={cn(
          'flex items-center justify-center flex-col gap-2',
          className
        )}
      >
        <h4 className={'dashboard-label'}>{label}</h4>
        <a
          className="flex items-center gap-3"
          href={getProviderLink(provider)}
          rel="noreferrer"
          target="_blank"
        >
          <ProviderLogo className="size-12" provider={provider} />{' '}
          {withName ? <p>{provider.name}</p> : null}
        </a>
      </article>
    </Tooltip>
  )
}
