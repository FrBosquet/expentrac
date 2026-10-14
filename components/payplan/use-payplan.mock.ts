import { baseContract, basePeriod } from '@lib/mocks'
import { unwrapSub } from '@lib/sub'

export const sub1 = unwrapSub({
  ...baseContract,
  id: '1',
  name: 'Sub 1',
  periods: [
    {
      ...basePeriod,
      id: '1',
      from: new Date('2021-01-01'),
      feeCents: 20000
    }
  ]
})

export const sub2 = unwrapSub({
  ...baseContract,
  id: '2',
  name: 'Sub 2',
  periods: [
    {
      ...basePeriod,
      id: '2',
      from: new Date('2021-06-01'),
      feeCents: 10000
    }
  ]
})

export const sub3 = unwrapSub({
  ...baseContract,
  id: '3',
  name: 'Sub 3',
  periods: [
    {
      ...basePeriod,
      id: '3',
      from: new Date('2021-01-01'),
      to: new Date('2021-05-31'),
      feeCents: 5000
    },
    {
      ...basePeriod,
      id: '3.1',
      from: new Date('2021-06-01'),
      feeCents: 5500
    }
  ]
})
