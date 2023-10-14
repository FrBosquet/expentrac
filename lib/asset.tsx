'use client'

import { getSubSharedFee } from '@components/Summary'
import { getLoanExtendedInformation } from '@lib/loan'
import { type AssetType, type SubAsset } from '@types'
import { isInXDays, isTomorrow, isYesterday } from './dates'

export const isSub = (asset: AssetType): asset is SubAsset => {
  return Object.hasOwnProperty.call(asset, 'sub')
}

const getDateText = (date: Date) => {
  if (isYesterday(date)) return 'Yesterday'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isInXDays(date, 2)) return 'In two days'
  if (isInXDays(date, -2)) return 'Two days ago'

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export const getAssetData = (asset: AssetType) => {
  const dateText = getDateText(asset.date)

  if (isSub(asset)) {
    const { id, name, vendor } = asset.sub

    const fee = getSubSharedFee(asset.sub)

    return { id, name, vendor, type: 'subscription', fee, dateText }
  } else {
    const { id, name, vendor } = asset.loan

    const { holderFee } = getLoanExtendedInformation(asset.loan) // TODO: UNIFY FUNCTIONS TO EXTEND LOAN/SUB INFO

    return { name, vendor, type: 'loan', id, fee: holderFee, dateText }
  }
}
