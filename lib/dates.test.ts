import { CONTRACT_TYPE } from './contract'
import { PERIODICITY, getOngoingPeriod } from './dates'
import { type Contract, type RawContract } from './prisma'

const baseContract: RawContract = {
  id: '0',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: '1',
  name: 'Base contract',
  type: CONTRACT_TYPE.SUBSCRIPTION,
  fee: 0
}

const basePeriod = {
  createdAt: new Date(),
  updatedAt: new Date(),
  payday: 15,
  paymonth: null,
  periodicity: PERIODICITY.MONTHLY,
  contractId: 'todo'
}

describe('getOngoingPeriod', () => {
  it('should be defined', () => {
    expect(getOngoingPeriod).toBeDefined()
  })

  describe('should return the ongoing period', () => {
    const contract = {
      ...baseContract,
      periods: [
        {
          ...basePeriod,
          from: new Date('1986-08-02'),
          to: new Date('1986-08-25'),
          fee: 10
        },
        {
          ...basePeriod,
          from: new Date('2021-01-05'),
          to: new Date('2021-02-15'),
          fee: 200
        },
        {
          ...basePeriod,
          from: new Date('2021-02-16'),
          fee: 210
        }
      ]
    }

    it('should return the ongoing period', () => {
      expect(getOngoingPeriod(contract as Contract, new Date('2021-02-10'))).toHaveProperty('fee', 200)
    })

    it('should return the ongoing period', () => {
      expect(getOngoingPeriod(contract as Contract, new Date('1986-08-24'))).toHaveProperty('fee', 10)
    })

    it('should return null if no period', () => {
      expect(getOngoingPeriod(contract as Contract, new Date('1992-08-24'))).toBe(undefined)
    })

    it('should return an unfinished period', () => {
      expect(getOngoingPeriod(contract as Contract, new Date('2021-03-15'))).toHaveProperty('fee', 210)
    })

    it('should lazy capture period that starts this month', () => {
      expect(getOngoingPeriod(contract as Contract, new Date('2021-02-16'))).toHaveProperty('fee', 210)
    })

    it.only('should lazy capture period that ends this month', () => {
      expect(getOngoingPeriod(contract as Contract, new Date('1986-08-26'))).toHaveProperty('fee', 10)
    })
  })
})
