export const MAX_CENTS = 2_147_483_647

// Nonnegative decimal inputs round half-up to the nearest cent, without binary floating arithmetic.
export function eurosToCents(value: string | number): number {
  const match = /^(\d*)(?:\.(\d*))?$/.exec(String(value).trim())
  if (!match || !(match[1] || match[2]))
    throw new Error('Use a nonnegative decimal amount')
  const fraction = (match[2] ?? '').padEnd(3, '0')
  const cents =
    BigInt(match[1] || '0') * 100n +
    BigInt(fraction.slice(0, 2)) +
    (Number(fraction[2]) >= 5 ? 1n : 0n)
  if (cents > BigInt(MAX_CENTS))
    throw new Error('Amount exceeds the supported range')
  return Number(cents)
}
export function centsToEuros(cents: number) {
  if (!Number.isSafeInteger(cents)) throw new Error('Invalid integer cents')
  return cents / 100
}
export function splitCents(
  total: number,
  owner: string,
  acceptedRecipients: string[]
) {
  if (!Number.isSafeInteger(total) || total < 0)
    throw new Error('Invalid integer cents')
  const participants = [
    owner,
    ...Array.from(new Set(acceptedRecipients))
      .filter((id) => id !== owner)
      .sort()
  ]
  const base = Math.floor(total / participants.length)
  const remainder = total % participants.length
  return Object.fromEntries(
    participants.map((id, index) => [id, base + (index < remainder ? 1 : 0)])
  )
}
export function holderAmount(
  total: number,
  contract: {
    userId: string
    shares: Array<{ toId: string; accepted: boolean | null }>
  },
  viewer = contract.userId
) {
  const split = splitCents(
    total,
    contract.userId,
    contract.shares.filter((s) => s.accepted === true).map((s) => s.toId)
  )
  return centsToEuros(split[viewer] ?? 0)
}
export function sumMoney(...amounts: number[]) {
  return centsToEuros(
    amounts.reduce((sum, value) => sum + Math.round(value * 100), 0)
  )
}
