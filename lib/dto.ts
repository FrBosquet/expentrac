import { centsToEuros, eurosToCents } from './money'
import { type Contract } from './models'

export interface ContractPreview {
  id: string
  name: string
  type: string
  owner: { id: string; name: string | null; image: string | null }
  monthlyAmount: number
}
function object(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  )
}
export function contractPreview(contract: Contract): ContractPreview {
  const period =
    contract.periods.find(
      (p) =>
        new Date(p.from) <= new Date() &&
        (!p.to || new Date(p.to) >= new Date())
    ) ?? contract.periods[0]
  return {
    id: contract.id,
    name: contract.name,
    type: contract.type,
    owner: {
      id: contract.userId,
      name: contract.user?.name ?? null,
      image: contract.user?.image ?? null
    },
    monthlyAmount: period
      ? centsToEuros(
          Math.round(
            period.feeCents / (period.periodicity === 'YEARLY' ? 12 : 1)
          )
        )
      : 0
  }
}

// User model fields and recursive includes are never part of public resource DTOs.
// Explicit search/profile selects have no emailVerified field and retain their selected fields.
export function safeDto(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(safeDto)
  if (!object(value)) return value
  if ('emailVerified' in value)
    return { id: value.id, name: value.name, image: value.image }
  const result: Record<string, unknown> = Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, safeDto(child)])
  )
  if (
    typeof value.fee === 'number' &&
    !('feeCents' in value) &&
    ('periods' in value || ('contractId' in value && 'from' in value))
  ) {
    result.feeCents = eurosToCents(value.fee)
    delete result.fee
  }
  if (
    'contractId' in value &&
    'toId' in value &&
    'accepted' in value &&
    object(value.contract)
  ) {
    result.preview = contractPreview(safeDto(value.contract) as Contract)
    if (value.accepted !== true) result.contract = null
    else if (object(result.contract) && Array.isArray(result.contract.shares))
      result.contract.shares = result.contract.shares.filter(
        (share) => object(share) && share.accepted === true
      )
  }
  if (
    (value.type === 'LOAN_SHARE' || value.type === 'SUB_SHARE') &&
    typeof value.payload === 'string'
  ) {
    try {
      const payload = JSON.parse(value.payload)
      if (object(payload.contract))
        result.payload = JSON.stringify({
          preview: contractPreview(safeDto(payload.contract) as Contract),
          share: { id: payload.share?.id },
          state: payload.state
        })
      else result.payload = JSON.stringify(safeDto(payload))
    } catch {
      result.payload = JSON.stringify({
        message: 'This notification is unavailable'
      })
    }
  } else if ('payload' in value && typeof value.payload === 'string') {
    try {
      result.payload = JSON.stringify(safeDto(JSON.parse(value.payload)))
    } catch {
      result.payload = null
    }
  }
  return result
}
