import { eurosToCents, centsToEuros } from '@lib/money'
import { CONTRACT_TYPE } from '@lib/contract'
import { prisma } from '@lib/prisma'
import { SELECT_OPTIONS } from '@types'

import { ApiError } from './api'

export async function jsonObject(
  req: Request
): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await req.json()
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error()
    return value as Record<string, unknown>
  } catch {
    throw new ApiError(400, 'Invalid JSON object')
  }
}
export function text(value: unknown, name: string, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max)
    throw new ApiError(400, `Invalid ${name}`)
  return value.trim()
}
export function identifier(value: unknown) {
  const id = text(value, 'id', 128)
  if (!/^[a-zA-Z0-9_:/-]+$/.test(id)) throw new ApiError(400, 'Invalid id')
  return id
}
export function amount(value: unknown, name = 'amount') {
  if (
    (typeof value !== 'string' && typeof value !== 'number') ||
    (typeof value === 'string' && !value.trim())
  )
    throw new ApiError(400, `Invalid ${name}`)
  const result = Number(value)
  if (!Number.isFinite(result) || result < 0 || result > 21_474_836.47)
    throw new ApiError(400, `Invalid ${name}`)
  try {
    return centsToEuros(eurosToCents(value))
  } catch {
    throw new ApiError(400, `Invalid ${name}`)
  }
}
export function integer(
  value: unknown,
  name: string,
  min: number,
  max: number
) {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    (typeof value === 'string' && !value.trim())
  )
    throw new ApiError(400, `Invalid ${name}`)
  const result = Number(value)
  if (!Number.isInteger(result) || result < min || result > max)
    throw new ApiError(400, `Invalid ${name}`)
  return result
}
export function dateInput(value: unknown) {
  const valueText = text(value, 'date', 10)
  const date = new Date(valueText)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(valueText) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== valueText
  )
    throw new ApiError(400, 'Invalid date')
  return date
}
export function optionalUrl(value: unknown) {
  if (value === undefined || (typeof value === 'string' && !value.trim()))
    return ''
  const url = text(value, 'URL', 2048)
  try {
    if (!['http:', 'https:'].includes(new URL(url).protocol)) throw new Error()
  } catch {
    throw new ApiError(400, 'Invalid URL')
  }
  return url
}

export async function contractInput(
  raw: Record<string, unknown>,
  type: CONTRACT_TYPE,
  userId: string
) {
  const body: Record<string, unknown> = {
    ...raw,
    name: text(raw.name, 'name'),
    fee: String(amount(raw.fee, 'fee')),
    initial: String(
      amount(
        raw.initial === undefined || raw.initial === '' ? 0 : raw.initial,
        'initial'
      )
    ),
    link: optionalUrl(raw.link)
  }
  if (type === CONTRACT_TYPE.LOAN) {
    const from = dateInput(raw.startDate)
    const to = dateInput(raw.endDate)
    if (from > to) throw new ApiError(400, 'Start date must precede end date')
    body.payday = raw.payday
      ? integer(raw.payday, 'payday', 1, 31)
      : from.getUTCDate()
  } else {
    if (raw.yearly !== undefined && raw.yearly !== 'on' && raw.yearly !== 'off')
      throw new ApiError(400, 'Invalid yearly setting')
    body.payday = integer(raw.payday, 'payday', 1, 31)
    if (raw.yearly === 'on')
      body.paymonth = integer(raw.paymonth, 'paymonth', 0, 11)
    else body.paymonth = undefined
  }
  const providerIds: string[] = []
  for (const name of ['vendorId', 'platformId', 'lenderId']) {
    const id = raw[name] ? identifier(raw[name]) : SELECT_OPTIONS.NONE
    body[name] = id
    if (id !== SELECT_OPTIONS.NONE) providerIds.push(id)
  }
  const uniqueProviders = [...new Set(providerIds)]
  if (
    uniqueProviders.length &&
    (await prisma.provider.count({
      where: { id: { in: uniqueProviders } }
    })) !== uniqueProviders.length
  )
    throw new ApiError(400, 'Unknown provider')
  const recipients = Object.entries(raw)
    .filter(([key]) => key.startsWith('sharedWith'))
    .map(([, value]) => identifier(value))
  if (
    recipients.length > 20 ||
    new Set(recipients).size !== recipients.length ||
    recipients.includes(userId)
  )
    throw new ApiError(400, 'Invalid share recipients')
  if (
    recipients.length &&
    (await prisma.user.count({ where: { id: { in: recipients } } })) !==
      recipients.length
  )
    throw new ApiError(400, 'Unknown share recipient')
  if (
    recipients.length &&
    (await prisma.share.count({
      where: {
        fromId: userId,
        createdAt: { gte: new Date(Date.now() - 3_600_000) }
      }
    })) +
      recipients.length >
      20
  )
    throw new ApiError(429, 'Invitation limit reached; try again later')
  return body
}
