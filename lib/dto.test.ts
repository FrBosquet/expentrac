import { safeDto } from './dto'
import { baseContract, basePeriod } from './mocks'

const contract = {
  ...baseContract,
  periods: [{ ...basePeriod, from: new Date('2026-01-01'), to: null }],
  user: {
    ...baseContract.user,
    email: 'private@example.test',
    emailVerified: null,
    occupation: 'Private occupation'
  }
}
test('private user model fields are stripped recursively', () => {
  const result = safeDto({ data: contract }) as any
  expect(result.data.user).toEqual({
    id: 'fixture-user',
    name: 'Fixture',
    image: null
  })
  expect(JSON.stringify(result)).not.toContain('private@example.test')
  expect(result.data.periods[0].from).toBeInstanceOf(Date)
})
test('a pending invitation has a preview, without contract links, periods or private users', () => {
  const result = safeDto({
    id: 's',
    contractId: 'c',
    toId: 'recipient',
    accepted: null,
    contract
  }) as any
  expect(result.contract).toBeNull()
  expect(result.preview.name).toBe(contract.name)
  expect(result.preview.periods).toBeUndefined()
})
test('legacy invitation notification snapshots are reduced to previews at read time', () => {
  const result = safeDto({
    type: 'LOAN_SHARE',
    payload: JSON.stringify({ contract, share: { id: 's' }, state: 0 })
  }) as any
  const payload = JSON.parse(result.payload)
  expect(payload.contract).toBeUndefined()
  expect(payload.preview.name).toBe(contract.name)
  expect(result.payload).not.toContain('private@example.test')
})
