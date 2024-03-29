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
          to: new Date('2022-02-10'),
          fee: 210
        },
        {
          ...basePeriod,
          from: new Date('2022-02-11'),
          fee: 220
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

    it('should capture period that starts this month', () => {
      expect(getOngoingPeriod(contract as Contract, new Date('2022-02-1'))).toHaveProperty('fee', 220)
    })

    it('should capture period that ends this month', () => {
      expect(getOngoingPeriod(contract as Contract, new Date('1986-08-26'))).toHaveProperty('fee', 10)
    })
  })

  describe('should avoid collisions by checking the payday', () => {
    const contract = {
      ...baseContract,
      periods: [
        {
          ...basePeriod,
          from: new Date('2021-01-01'),
          to: new Date('2021-01-15'),
          fee: 150
        },
        {
          ...basePeriod,
          from: new Date('2021-01-16'),
          to: new Date('2021-01-31'),
          fee: 250
        }
      ]
    }

    it('should return the ongoing period that has the payday for the given month', () => {
      expect(getOngoingPeriod(contract as Contract, new Date('2021-01-17'))).toHaveProperty('fee', 150)
    })
  })
})
