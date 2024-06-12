'use client'

import { type Loan } from '@lib/loan'

import { getDateText } from './dates'
import { type Subscription } from './sub'

export type UnwrappedContract = Loan | Subscription

export const getAssetData = (contract: UnwrappedContract) => {
  const { name, id, type } = contract
  const dateText = getDateText(
    contract.time.currentMonthPaymentDate ?? new Date()
  )
  const nextDateText = getDateText(
    contract.time.currentMonthPaymentDate ?? new Date()
  )

  return {
    name,
    vendor: contract.providers.vendor,
    type,
    id,
    fee: contract.fee.holder,
    dateText,
    nextDateText
  }
}
