import { CONTRACT_TYPE } from '@lib/contract'
import { prisma } from '@lib/prisma'

import { amount, contractInput, dateInput } from './validation'

jest.mock('@lib/auth', () => ({ authOptions: {} }))
jest.mock('@lib/prisma', () => ({
  prisma: {
    provider: { count: jest.fn() },
    user: { count: jest.fn() },
    share: { count: jest.fn() }
  }
}))
const loan = {
  name: 'Fixture',
  fee: '12.50',
  initial: '0',
  startDate: '2026-01-01',
  endDate: '2026-12-31'
}
beforeEach(() => {
  jest.clearAllMocks()
  ;(prisma.user.count as jest.Mock).mockResolvedValue(1)
  ;(prisma.provider.count as jest.Mock).mockResolvedValue(1)
  ;(prisma.share.count as jest.Mock).mockResolvedValue(0)
})
test.each([NaN, Infinity, -1, 'NaN', '', null, true, {}, 30_000_000])(
  'invalid financial input %s is rejected',
  (input) => {
    expect(() => amount(input)).toThrow()
  }
)
test.each(['2026-02-30', '2026-13-01', 'invalid'])(
  'invalid date %s is rejected',
  (input) => {
    expect(() => dateInput(input)).toThrow()
  }
)
test('inverted loan dates are rejected', async () => {
  await expect(
    contractInput(
      { ...loan, startDate: '2027-01-01' },
      CONTRACT_TYPE.LOAN,
      'owner'
    )
  ).rejects.toMatchObject({ status: 400 })
})
test.each([0, 32, 1.5])(
  'subscription payday %s is rejected',
  async (payday) => {
    await expect(
      contractInput(
        { name: 'Sub', fee: '12', payday },
        CONTRACT_TYPE.SUBSCRIPTION,
        'owner'
      )
    ).rejects.toMatchObject({ status: 400 })
  }
)
test('unknown relations and self-sharing are rejected before contract writes', async () => {
  ;(prisma.provider.count as jest.Mock).mockResolvedValue(0)
  await expect(
    contractInput({ ...loan, vendorId: 'missing' }, CONTRACT_TYPE.LOAN, 'owner')
  ).rejects.toMatchObject({ status: 400 })
  await expect(
    contractInput(
      { ...loan, 'sharedWith:0': 'owner' },
      CONTRACT_TYPE.LOAN,
      'owner'
    )
  ).rejects.toMatchObject({ status: 400 })
})
test('share invitation bursts are limited', async () => {
  ;(prisma.share.count as jest.Mock).mockResolvedValue(20)
  await expect(
    contractInput(
      { ...loan, 'sharedWith:0': 'recipient' },
      CONTRACT_TYPE.LOAN,
      'owner'
    )
  ).rejects.toMatchObject({ status: 429 })
})
