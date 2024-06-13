/* eslint-disable @next/next/no-img-element */
import { type Provider } from '@lib/prisma'
import { type BrandExtendedInfo, FormatEnum } from '@types'
import { type LucideIcon, PiggyBankIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface Props {
  provider?: Provider
  className?: string
  Default?: LucideIcon
}

const targetTheme = 'dark'

export const getLogoUrl = (data: BrandExtendedInfo) => {
  let bestCandidate = undefined as string | undefined
  let foundOther = false
  let foundPng = false
  const logos = data.logos

  for (const logo of logos) {
    const formats = logo.formats
    const theme = logo.theme

    for (const format of formats) {
      if (format.format === FormatEnum.SVG && theme === targetTheme) {
        return format.src
      } else if (format.format === FormatEnum.SVG) {
        bestCandidate = format.src
      } else if (format.format === FormatEnum.PNG) {
        foundPng = true
        bestCandidate = format.src
      } else if (!foundPng && !foundOther) {
        foundOther = true
        bestCandidate = format.src
      }
    }
  }

  return bestCandidate
}

export const ProviderLogo = ({
  provider,
  className,
  Default = PiggyBankIcon
}: Props) => {
  if (!provider || !provider.isFetched) {
    return <Default className={twMerge('w-16 h-16', className)} />
  }

  const logoSrc = getLogoUrl(
    provider.rawContent as unknown as BrandExtendedInfo
  )

  return (
    <img
      alt={provider.name}
      className={twMerge(
        'w-16 h-16 fill-black object-contain bg-slate-300 p-1 rounded-full',
        className
      )}
      src={logoSrc}
    />
  )
}
