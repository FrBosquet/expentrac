'use client'

import { getSubSharedFee } from '@components/Summary'
import { type Loan } from '@lib/loan'
import { type SubscriptionComplete } from '@types'
import { getDateText } from './dates'

export interface SubAsset {
  id: string
  sub: SubscriptionComplete
  date: Date
}

export interface LoanAsset {
  id: string
  loan: Loan
  date: Date
}

export type AssetType = SubAsset | LoanAsset

export const isSub = (asset: AssetType): asset is SubAsset => {
  return Object.hasOwnProperty.call(asset, 'sub')
}

export const getAssetData = (asset: AssetType) => {
  const dateText = getDateText(asset.date)

  if (isSub(asset)) {
    const { id, name, vendor } = asset.sub

    const fee = getSubSharedFee(asset.sub)

    return { id, name, vendor, type: 'subscription', fee, dateText }
  } else {
    const { id, name, vendor, fee: { holder } } = asset.loan

    return { name, vendor, type: 'loan', id, fee: holder, dateText }
  }
}
