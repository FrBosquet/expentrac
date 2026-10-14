import { CONTRACT_TYPE } from './contract'
import { PERIODICITY } from './dates'
import { type Contract } from './models'

export const baseContract: Contract = {
  id: '0',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: '1',
  name: 'Base contract',
  type: CONTRACT_TYPE.SUBSCRIPTION,
  fee: 0,
  providers: [],
  periods: [],
  resources: [],
  shares: [],
  user: { id: 'fixture-user', name: 'Fixture', image: null }
}

export const basePeriod = {
  id: '0',
  createdAt: new Date(),
  updatedAt: new Date(),
  payday: 15,
  paymonth: null,
  periodicity: PERIODICITY.MONTHLY,
  contractId: 'todo',
  to: null
}
