import { CONTRACT_TYPE } from '@lib/contract'
import { unwrapLoan } from '@lib/loan'
import { type Contract } from '@lib/prisma'
import { unwrapSub, type Subscription } from '@lib/sub'
import { type StateCreator } from 'zustand'

export interface ContractsSlice {
  contracts: Contract[]
  setContracts: (contracts: Contract[]) => void
  addContract: (contract: Contract) => void
  updateContract: (contract: Contract) => void
  removeContract: (contract: Contract) => void
}

const sortFunction = (a: Contract, b: Contract) => {
  if (a.periods.length === 0) return -1
  if (b.periods.length === 0) return 1

  const aPeriod = a.periods[0]
  const bPeriod = b.periods[0]

  return aPeriod.from > bPeriod.from ? -1 : 1
}

export const createContractsSlice: StateCreator<ContractsSlice> = (set) => ({
  contracts: [],
  setContracts: (rawContracts: Contract[]) => {
    set({
      contracts: rawContracts.sort(sortFunction)
    })
  },
  addContract: (contract: Contract) => {
    set(state => ({
      contracts: [...state.contracts, contract].sort(sortFunction)
    }))
  },
  updateContract: (contract: Contract) => {
    set(state => ({
      contracts: state.contracts.map(l => l.id === contract.id ? contract : l)
    }))
  },
  removeContract: (contract: Contract) => {
    set(state => ({
      contracts: state.contracts.filter(l => l.id !== contract.id)
    }))
  }
})

export const getContractsSetter = (state: ContractsSlice) => state.setContracts

export const getLoans = (refDate: Date) => (state: ContractsSlice) => {
  const { contracts } = state

  return contracts
    .filter(contract => contract.type === CONTRACT_TYPE.LOAN)
    .map(contract => unwrapLoan(contract, refDate))
}

export const getActiveLoans = (refDate: Date) => (state: ContractsSlice) => {
  const { contracts } = state

  return contracts
    .filter(contract => contract.type === CONTRACT_TYPE.LOAN)
    .map(contract => unwrapLoan(contract, refDate))
    .filter(loan => loan.time.isOngoing)
}

export const getLoan = (refDate: Date, id: string) => (state: ContractsSlice) => {
  const { contracts } = state

  const contract = contracts.find(contract => contract.id === id)

  if (!contract || contract.type !== CONTRACT_TYPE.LOAN) return null

  return unwrapLoan(contract, refDate)
}

export const getHasLoans = (state: ContractsSlice) => {
  const { contracts } = state

  return contracts.some(contract => contract.type === CONTRACT_TYPE.LOAN)
}

export const getSubs = (state: ContractsSlice): Subscription[] => {
  const { contracts } = state

  return contracts
    .filter(contract => contract.type === CONTRACT_TYPE.SUBSCRIPTION)
    .map(contract => unwrapSub(contract))
}

export const getSub = (id: string) => (state: ContractsSlice) => {
  const { contracts } = state

  const contract = contracts.find(contract => contract.id === id)

  if (!contract || contract.type !== CONTRACT_TYPE.SUBSCRIPTION) return null

  return unwrapSub(contract)
}

export const getHasSubs = (state: ContractsSlice) => {
  const { contracts } = state

  return contracts.some(contract => contract.type === CONTRACT_TYPE.SUBSCRIPTION)
}
