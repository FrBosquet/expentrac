import {
  type Contract,
  type Notification,
  type Provider,
  type ProviderOnContract,
  type Share,
  type User
} from '@lib/models'

import { isObject, restoreDates } from './http'

function record(value: unknown) {
  if (!isObject(value) || typeof value.id !== 'string')
    throw new Error('Missing resource id')
  return restoreDates(value) as Record<string, unknown>
}
export function contract(value: unknown): Contract {
  const data = record(value)
  if (
    typeof data.userId !== 'string' ||
    !['LOAN', 'SUBSCRIPTION', 'WORK'].includes(String(data.type)) ||
    !['periods', 'providers', 'shares', 'resources'].every((key) =>
      Array.isArray(data[key])
    )
  )
    throw new Error('Invalid contract')
  return data as Contract
}
export function share(value: unknown): Share {
  const data = record(value)
  if (
    typeof data.toId !== 'string' ||
    typeof data.fromId !== 'string' ||
    ![true, false, null].includes(data.accepted as boolean | null)
  )
    throw new Error('Invalid share')
  data.contract = contract(data.contract)
  return data as Share
}
export function notification(value: unknown): Notification {
  const data = record(value)
  if (
    typeof data.userId !== 'string' ||
    typeof data.type !== 'string' ||
    typeof data.ack !== 'boolean' ||
    !(data.date instanceof Date)
  )
    throw new Error('Invalid notification')
  return data as Notification
}
export function provider(value: unknown): Provider {
  const data = record(value)
  if (typeof data.name !== 'string') throw new Error('Invalid provider')
  return data as Provider
}
export function providerRelation(value: unknown): ProviderOnContract {
  const data = record(value)
  data.contract = contract(data.contract)
  data.provider = provider(data.provider)
  return data as ProviderOnContract
}
export function user(value: unknown): User {
  return record(value) as User
}
