import { centsToEuros, eurosToCents, holderAmount, splitCents, sumMoney } from './money'

test.each([['0.10', 10], ['1.005', 101], ['10.004', 1000], ['10.005', 1001], ['21474836.47', 2147483647]])('decimal %s rounds half-up to cents', (input, cents) => {
  expect(eurosToCents(input)).toBe(cents)
})
test.each(['NaN', '-1', 'Infinity', '21474836.48'])('invalid stored amount %s is rejected', (input) => {
  expect(() => eurosToCents(input)).toThrow()
})
test('splits preserve every cent, ordered owner first then recipient ID', () => {
  expect(splitCents(1000, 'owner', ['b', 'a', 'a'])).toEqual({ owner: 334, a: 333, b: 333 })
  for (let total = 0; total < 100; total++) {
    const amounts = Object.values(splitCents(total, 'owner', ['b', 'a']))
    expect(amounts.reduce((sum, value) => sum + value, 0)).toBe(total)
    expect(Math.max(...amounts) - Math.min(...amounts)).toBeLessThanOrEqual(1)
  }
})
test('shared amounts use the recipient identity and exclude pending shares', () => {
  const contract = { userId: 'owner', shares: [{ toId: 'a', accepted: true }, { toId: 'b', accepted: true }, { toId: 'pending', accepted: null }] }
  expect(holderAmount(1000, contract)).toBe(3.34)
  expect(holderAmount(1000, contract, 'a')).toBe(3.33)
  expect(holderAmount(1000, contract, 'pending')).toBe(0)
})
test('cent addition avoids familiar decimal accumulation errors', () => {
  expect(sumMoney(0.1, 0.2)).toBe(0.3)
  expect(centsToEuros(30)).toBe(0.3)
})
