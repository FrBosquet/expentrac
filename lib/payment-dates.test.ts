import { paymentDate } from './dates'
import { unwrapLoan } from './loan'
import { unwrapSub } from './sub'
import { baseContract, basePeriod } from './mocks'

afterEach(() => jest.useRealTimers())
test.each([
  [2026, 1, 31, 28],
  [2024, 1, 31, 29],
  [2026, 3, 31, 30],
  [2026, 12, 31, 31]
])(
  'scheduled days clamp in year %s month %s',
  (year, month, payday, expected) => {
    const result = paymentDate(year, month, payday)
    expect(result.getDate()).toBe(expected)
    expect(result.getMonth()).toBe(((month % 12) + 12) % 12)
  }
)
test('loan and subscription previews honor day 31 without rolling past February', () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 1, 28, 12))
  const periods = [
    {
      ...basePeriod,
      from: new Date(2026, 0, 1),
      to: new Date(2028, 11, 31),
      feeCents: 1001,
      payday: 31
    }
  ]
  const loan = unwrapLoan(
    { ...baseContract, type: 'LOAN', periods },
    new Date(2026, 1, 1)
  )
  expect(loan.time.payday).toBe(31)
  expect(loan.time.currentMonthPaymentDate.getDate()).toBe(28)
  expect(loan.time.nextPaymentDate.getMonth()).toBe(2)
  expect(loan.time.nextPaymentDate.getDate()).toBe(31)
  const sub = unwrapSub(
    { ...baseContract, periods: [{ ...periods[0], to: null }] },
    new Date(2026, 1, 1)
  )
  expect(sub.time.isPayday).toBe(true)
  expect(sub.time.nextPaymentDate?.getDate()).toBe(31)
  expect(sub.time.nextPaymentDate?.getMonth()).toBe(2)
})
test('yearly leap-day payments retain their scheduled month across years', () => {
  jest.useFakeTimers().setSystemTime(new Date(2024, 2, 1, 12))
  const sub = unwrapSub(
    {
      ...baseContract,
      periods: [
        {
          ...basePeriod,
          from: new Date(2023, 0, 1),
          payday: 29,
          paymonth: 1,
          periodicity: 'YEARLY'
        }
      ]
    },
    new Date(2024, 1, 1)
  )
  expect(sub.time.nextPaymentDate?.getFullYear()).toBe(2025)
  expect(sub.time.nextPaymentDate?.getMonth()).toBe(1)
  expect(sub.time.nextPaymentDate?.getDate()).toBe(28)
})
