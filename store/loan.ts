import { unwrapLoan } from '@lib/loan'
import { type Contract } from '@lib/prisma'
import { type StateCreator } from 'zustand'

export interface LoanSlice {
  loans: Contract[]
  setLoans: (loans: Contract[]) => void
  addLoan: (loan: Contract) => void
  updateLoan: (loan: Contract) => void
  removeLoan: (loan: Contract) => void
}

const sortFunction = (a: Contract, b: Contract) => {
  if (a.periods.length === 0) return -1
  if (b.periods.length === 0) return 1

  const aPeriod = a.periods[0]
  const bPeriod = b.periods[0]

  return aPeriod.from > bPeriod.from ? -1 : 1
}

export const createLoanSlice: StateCreator<LoanSlice> = (set) => ({
  loans: [],
  setLoans: (rawLoans: Contract[]) => {
    set({
      loans: rawLoans.sort(sortFunction)
    })
  },
  addLoan: (loan: Contract) => {
    set(state => ({
      loans: [...state.loans, loan].sort(sortFunction)
    }))
  },
  updateLoan: (loan: Contract) => {
    set(state => ({
      loans: state.loans.map(l => l.id === loan.id ? loan : l)
    }))
  },
  removeLoan: (loan: Contract) => {
    set(state => ({
      loans: state.loans.filter(l => l.id !== loan.id)
    }))
  }
})

export const getLoansSetter = (state: LoanSlice) => state.setLoans

export const getLoans = (refDate: Date) => (state: LoanSlice) => {
  const { loans } = state

  return loans.map(loan => unwrapLoan(loan, refDate))
}

export const getLoan = (refDate: Date, id: string) => (state: LoanSlice) => {
  const { loans } = state

  const loan = loans.find(loan => loan.id === id)

  if (!loan) return null

  return unwrapLoan(loan, refDate)
}
