import { getContractStatus, getOngoingPeriod } from './dates'
import { baseContract, basePeriod } from './mocks'

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
      expect(getOngoingPeriod(contract, new Date('2021-02-10'))).toHaveProperty('fee', 200)
    })

    it('should return the ongoing period', () => {
      expect(getOngoingPeriod(contract, new Date('1986-08-24'))).toHaveProperty('fee', 10)
    })

    it('should return null if no period', () => {
      expect(getOngoingPeriod(contract, new Date('1992-08-24'))).toBe(undefined)
    })

    it('should return an unfinished period', () => {
      expect(getOngoingPeriod(contract, new Date('2021-03-15'))).toHaveProperty('fee', 210)
    })

    it('should capture period that starts this month', () => {
      expect(getOngoingPeriod(contract, new Date('2022-02-1'))).toHaveProperty('fee', 220)
    })

    it('should capture period that ends this month', () => {
      expect(getOngoingPeriod(contract, new Date('1986-08-26'))).toHaveProperty('fee', 10)
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
      expect(getOngoingPeriod(contract, new Date('2021-01-17'))).toHaveProperty('fee', 150)
    })
  })
})

describe('getContractState', () => {
  it('should be defined', () => {
    expect(getContractStatus).toBeDefined()
  })

  describe('paused subscription', () => {
    it('should return paused if there is no ongoing period', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-01-01'),
            to: new Date('2021-01-15'),
            fee: 150
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-02-01'))

      expect(status.ongoing).toBe(false)
    })

    it('should return paused if a period is coming', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2024-01-01'),
            fee: 150
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-02-01'))

      expect(status.ongoing).toBe(false)
    })

    it('should return paused if there is no period at all', () => {
      const contract = {
        ...baseContract,
        periods: []
      }

      const status = getContractStatus(contract, new Date('2021-02-01'))

      expect(status.ongoing).toBe(false)
    })
  })

  describe('starting subscription', () => {
    it('should return start if its going to start on the given month', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-01-15'),
            fee: 150
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-01-01'))

      expect(status.starts).toBe(true)
      expect(status.ongoing).toBe(true)
    })

    it('should return start if it started on a given month', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-01-01'),
            fee: 150
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-01-15'))

      expect(status.starts).toBe(true)
      expect(status.ongoing).toBe(true)
    })
  })

  describe('ongoing', () => {
    it('should return ongoing if its ongoing with no end', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-01-01'),
            fee: 150
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-02-01'))

      expect(status.ongoing).toBe(true)
    })

    it('should return ongoing if its ongoing', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-01-01'),
            to: new Date('2021-03-01'),
            fee: 150
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-02-01'))

      expect(status.ongoing).toBe(true)
    })
  })

  describe('ends', () => {
    it('should return ends if its going to end on the given month', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-01-01'),
            to: new Date('2021-01-31'),
            fee: 150
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-01-20'))

      expect(status.ends).toBe(true)
      expect(status.ongoing).toBe(true)
    })

    it('should return ends if it ends on a given month', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-01-01'),
            to: new Date('2021-01-15'),
            fee: 150
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-01-20'))

      expect(status.ends).toBe(true)
      expect(status.ongoing).toBe(true)
    })

    it('should start and ends on a given month', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-01-01'),
            to: new Date('2021-01-30'),
            fee: 150
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-01-10'))

      expect(status.ends).toBe(true)
      expect(status.ongoing).toBe(true)
      expect(status.starts).toBe(true)
    })
  })

  describe('updates', () => {
    it('should return updates if there is a new period starting on the given month', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-01-01'),
            to: new Date('2021-02-15'),
            fee: 150
          },
          {
            ...basePeriod,
            from: new Date('2021-02-16'),
            fee: 200
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-02-20'))

      expect(status.updates).toBe(true)
      expect(status.ongoing).toBe(true)
    })

    it('should fill everything', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-02-01'),
            to: new Date('2021-02-15'),
            fee: 150
          },
          {
            ...basePeriod,
            from: new Date('2021-02-16'),
            fee: 200
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-02-01'))

      expect(status.starts).toBe(true)
      expect(status.updates).toBe(true)
      expect(status.ongoing).toBe(true)
    })

    it('should update for a changing month', () => {
      const contract = {
        ...baseContract,
        periods: [
          {
            ...basePeriod,
            from: new Date('2021-02-01'),
            to: new Date('2021-03-31'),
            fee: 150
          },
          {
            ...basePeriod,
            from: new Date('2021-04-01'),
            fee: 200
          }
        ]
      }

      const status = getContractStatus(contract, new Date('2021-04-05'))

      console.log(status)

      expect(status.updates).toBe(true)
      expect(status.ongoing).toBe(true)
    })
  })
})
