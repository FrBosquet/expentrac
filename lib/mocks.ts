import { CONTRACT_TYPE } from './contract'
import { PERIODICITY } from './dates'
import { type Contract } from './prisma'

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
  user: {
    createdAt: new Date(),
    updatedAt: new Date(),
    id: '0',
    name: null,
    email: null,
    emailVerified: null,
    image: null,
    occupation: null
  }
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
