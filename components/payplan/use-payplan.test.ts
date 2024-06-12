import { type Subscription } from '@lib/sub'

import { usePayplan } from './use-payplan'
import { sub1, sub2, sub3 } from './use-payplan.mock'

jest.mock('react', () => {
  const originalReact = jest.requireActual('react')
  return {
    ...originalReact,
    useMemo: jest.fn((fn) => fn())
  }
})

describe('usePayplan', () => {
  it('should be defined', () => {
    expect(usePayplan).toBeDefined()
  })

  describe('two subs, one starts mid year', () => {
    const subs: Subscription[] = [sub1, sub2]

    const date = new Date('2021-01-01')

    const payplan = usePayplan(date, { subs })

    it('should have 12 months', () => {
      expect(payplan).toHaveLength(12)
    })

    it('should have 200 as monthly pay for the first 5 months', () => {
      expect(payplan.slice(0, 5).map(({ monthlyPay }) => monthlyPay)).toEqual([
        200, 200, 200, 200, 200
      ])
    })

    it('should have 300 as monthly pay for the last 7 months', () => {
      expect(payplan.slice(5).map(({ monthlyPay }) => monthlyPay)).toEqual([
        300, 300, 300, 300, 300, 300, 300
      ])
    })
  })

  describe('two subs, one changing price', () => {
    const subs: Subscription[] = [sub1, sub3] as any[]

    const date = new Date('2021-01-01')

    const payplan = usePayplan(date, { subs })

    it('should have 12 months', () => {
      expect(payplan).toHaveLength(12)
    })

    it('should have 250 as monthly pay for the first 5 months', () => {
      expect(payplan.slice(0, 5).map(({ monthlyPay }) => monthlyPay)).toEqual([
        250, 250, 250, 250, 250
      ])
    })

    it('should have 255 as monthly pay for the last 7 months', () => {
      expect(payplan.slice(5).map(({ monthlyPay }) => monthlyPay)).toEqual([
        255, 255, 255, 255, 255, 255, 255
      ])
    })
  })
})
