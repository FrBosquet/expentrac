import { PERIODICITY } from '@lib/dates'

import { madridDay, paymentDayMatches } from './payment-day'

const period = {
  from: new Date('2020-01-01'),
  to: null,
  payday: 31,
  paymonth: null,
  periodicity: PERIODICITY.MONTHLY
}

test.each([
  ['2026-03-28T23:30:00Z', '2026-03-29'],
  ['2026-03-29T22:30:00Z', '2026-03-30'],
  ['2026-10-24T22:30:00Z', '2026-10-25'],
  ['2026-10-25T23:30:00Z', '2026-10-26']
])('Madrid business date across DST: %s', (input, expected) => {
  expect(madridDay(new Date(input))).toBe(expected)
})

test.each([
  ['2026-02-28', true],
  ['2028-02-29', true],
  ['2026-04-30', true],
  ['2026-03-30', false],
  ['2026-03-31', true]
])('payday 31 at month end %s', (day, result) => {
  expect(paymentDayMatches(period, day)).toBe(result)
})

test('yearly periods only match the specified month', () => {
  expect(
    paymentDayMatches(
      { ...period, periodicity: PERIODICITY.YEARLY, paymonth: 1 },
      '2026-02-28'
    )
  ).toBe(true)
  expect(
    paymentDayMatches(
      { ...period, periodicity: PERIODICITY.YEARLY, paymonth: 1 },
      '2026-03-31'
    )
  ).toBe(false)
})

test('periods outside their date range do not pay', () => {
  expect(
    paymentDayMatches({ ...period, from: new Date('2026-05-01') }, '2026-04-30')
  ).toBe(false)
  expect(
    paymentDayMatches({ ...period, to: new Date('2026-04-29') }, '2026-04-30')
  ).toBe(false)
})
