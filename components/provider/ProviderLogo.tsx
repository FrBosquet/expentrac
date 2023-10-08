import { type Provider } from '@lib/prisma'
import { cn } from '@lib/utils'
import { FormatEnum, type BrandExtendedInfo } from '@types'

interface Props {
  provider?: Provider
  className?: string
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

export const ProviderLogo = ({ provider, className }: Props) => {
  if (!provider || !provider.isFetched) {
    return undefined
  }

  const logoSrc = getLogoUrl(provider.rawContent as unknown as BrandExtendedInfo)

  return <img src={logoSrc} alt={provider.name} className={cn('w-16 h-16 fill-black object-contain', className)} />
}
