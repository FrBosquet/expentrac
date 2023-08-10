'use client'

import { BrandExtendedInfo, FormatEnum, ProviderFetched } from "@types"

type Props = {
  provider: ProviderFetched
}

// TODO: Update this with the selected theme
const targetTheme = 'dark'

const getLogoUrl = (data: BrandExtendedInfo) => {
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

const getAccentColor = (data: BrandExtendedInfo) => {
  const colors = data.colors

  const accent = colors.find(color => color.type === 'accent')

  return accent?.hex
}

export const FetchedProvider = ({ provider }: Props) => {
  const extendedData = provider.rawContent as BrandExtendedInfo

  const logoSrc = getLogoUrl(extendedData)
  const accentColor = getAccentColor(extendedData)

  return <article className='shadow-md border rounded-md p-4 flex flex-col justify-center gap-2 items-center border-b-8' style={{ borderBottomColor: accentColor }}>
    {logoSrc ? <img src={logoSrc} alt={extendedData.name} className="w-16 h-16 fill-black" /> : ''}
    <h3 className="text-md whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full text-slate-600">{extendedData.name}</h3>
  </article>
}